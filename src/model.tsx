import { createRef, MutableRefObject, useState } from "react";
import {
  QueryClient,
  useQuery,
  useInfiniteQuery,
  UseQueryResult,
  UseInfiniteQueryResult,
  UseInfiniteQueryOptions,
  InfiniteData,
  UseMutationResult,
  QueryFunction,
  QueryKey,
  MutationOptions,
  QueryOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import { TSchema, Static } from "@sinclair/typebox";
import {
  createCreateMutation,
  createUpdateMutation,
  createDeleteMutation,
} from "./mutation";

import {
  createCreateRequestFn,
  createGetRequestFn,
  createRemoveRequestFn,
  createPaginatedRequestFn,
  createSearchRequestFn,
  createUpdateRequestFn,
  QueryParameters,
} from "./request";

export type ModelId = string | number;

export type ModelFactoryOptions = {
  client: QueryClient;
  baseUrl: string;
  token?: MutableRefObject<string | null>;
};

export type ModelFactory<T extends TSchema> = (
  options: ModelFactoryOptions
) => Model<T>;

export class Model<TModel extends TSchema> {
  schema!: TModel;
  create!: (
    options?:
      | MutationOptions<Static<TModel>, unknown, Static<TModel>, unknown>
      | undefined
  ) => UseMutationResult<Static<TModel>, unknown, Static<TModel>, unknown>;
  update!: (
    id: string | number,
    options?:
      | MutationOptions<Static<TModel>, unknown, Static<TModel>, unknown>
      | undefined
  ) => UseMutationResult<Static<TModel>, unknown, Static<TModel>, unknown>;
  remove!: (
    options?: MutationOptions<Static<TModel>, unknown, Static<TModel>>
  ) => UseMutationResult<Static<TModel>, unknown, Static<TModel>, unknown>;
  get!: (
    id: ModelId,
    options?: QueryOptions<Static<TModel>>
  ) => UseQueryResult<Static<TModel>, unknown>;
  search!: (
    params?: QueryParameters,
    options?: UseQueryOptions<Static<TModel>[]>
  ) => UseQueryResult<Static<TModel>[], unknown>;
  paginated!: (
    params: PaginationParams
  ) => UseInfiniteQueryResult<InfiniteData<Static<TModel, []>[]>, Error>;
  invalidateOne!: (id: ModelId) => Promise<void>;
  invalidateAll!: () => Promise<void>;
  read!: (id: ModelId) => TModel | undefined;
  readAll!: () => TModel[] | undefined;
  readOneFromAll!: (id: ModelId) => TModel | undefined;
  constructor(model: Model<TModel>) {
    Object.assign(this, model);
  }
}

export type PaginationParams = {
  offset?: number;
  limit?: number;
  orderBy?: string;
};

interface CreateApiModelOptions<Schema extends TSchema> {
  name: string;
  resource: string;
  schema: Schema;
  idKey?: keyof Static<Schema> | "id";
}

const buildResourcePath = (baseUrl: string, resource: string) => {
  const cleanBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.substr(0, baseUrl.length - 1)
    : baseUrl;
  const cleanResource = resource.startsWith("/")
    ? resource.substr(1)
    : resource;
  return `${cleanBaseUrl}/${cleanResource}`;
};

export function createApiModel<TModel extends TSchema>({
  name,
  resource,
  schema,
  idKey = "id",
}: CreateApiModelOptions<TModel>): ModelFactory<TModel> & { schema: TModel } {
  const factoryFn = ({
    client,
    baseUrl,
    token = createRef<string>(),
  }: ModelFactoryOptions): Model<TModel> => {
    const modelKeys = {
      search: (params?: Record<string, string | number | boolean>) => [
        name,
        ...(params ? [params] : []),
      ],
      get: (id: ModelId) => [name, id],
    };

    const resourcePath = buildResourcePath(baseUrl, resource);

    const createMutation = createCreateMutation<TModel>(name, {
      client,
      idKey,
      createFn: createCreateRequestFn<TModel>({ resourcePath, token }),
      itemCacheKey: modelKeys.get,
      itemIndexCacheKey: modelKeys.search,
    });

    const updateMutation = createUpdateMutation<TModel>(name, {
      client,
      idKey,
      updateFn: createUpdateRequestFn<TModel>({
        resourcePath,
        idKey,
        token,
      }),
      itemCacheKey: modelKeys.get,
      itemIndexCacheKey: modelKeys.search,
    });

    const removeMutation = createDeleteMutation<TModel>(name, {
      client,
      idKey,
      deleteFn: createRemoveRequestFn<TModel & { id: ModelId }>({
        resourcePath,
        token,
      }),
      itemCacheKey: modelKeys.get,
      itemIndexCacheKey: modelKeys.search,
    });

    const itemQuery = (id: ModelId, options?: QueryOptions<Static<TModel>>) => {
      const fn = createGetRequestFn<TModel>({ resourcePath, token });
      return useQuery<Static<TModel>>({
        queryKey: modelKeys.get(id),
        queryFn: () => fn(id),
        initialData: [],
        ...options,
      });
    };

    const searchQuery = (
      params?: QueryParameters,
      options?: UseQueryOptions<Static<TModel>[]>
    ) => {
      const fn = createSearchRequestFn<TModel>({ resourcePath, token });
      return useQuery<Static<TModel>[]>({
        queryKey: modelKeys.search(params),
        queryFn: () => fn(params),
        ...options,
        initialData: [],
      });
    };

    const infiniteQuery = ({ offset = 0, limit = 100 }: PaginationParams) => {
      const fn = createPaginatedRequestFn<TModel>({ resourcePath, token });
      return useInfiniteQuery<
        Static<TModel, []>[],
        Error,
        InfiniteData<Static<TModel, []>[]>,
        QueryKey,
        number
      >({
        queryKey: modelKeys.search({ offset, limit }),
        queryFn: ({ pageParam }: { pageParam: number }) =>
          fn({
            limit,
            offset: pageParam * limit,
          }),
        defaultPageParam: 0,
        getNextPageParam: (lastPage, pages) => {
          return lastPage.length === limit ? pages.length : undefined;
        },
      });
    };

    const model: Model<TModel> = new Model({
      schema: schema,
      create: createMutation,
      update: updateMutation,
      remove: removeMutation,
      get: itemQuery,
      search: searchQuery,
      paginated: infiniteQuery,
      invalidateOne: (id: ModelId) =>
        client.invalidateQueries({ queryKey: modelKeys.get(id) }),
      invalidateAll: () =>
        client.invalidateQueries({ queryKey: modelKeys.search() }),
      read: (id: ModelId) => client.getQueryData<TModel>(modelKeys.get(id)),
      readAll: () => client.getQueryData<TModel[]>(modelKeys.search()),
      readOneFromAll: (id: ModelId) => {
        const all = client.getQueryData<TModel[]>(modelKeys.search()) ?? [];
        return all.find((item) => item.id === id);
      },
    });

    return model;
  };

  return Object.assign(factoryFn, { schema });
}
