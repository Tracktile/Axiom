import { createRef, MutableRefObject } from "react";
import {
  QueryClient,
  useQuery,
  useInfiniteQuery,
  UseQueryResult,
  UseInfiniteQueryResult,
  InfiniteData,
  UseMutationResult,
  MutationOptions,
  QueryOptions,
} from "@tanstack/react-query";
import { TSchema, Static } from "@sinclair/typebox";
import {
  createCreateMutation,
  createUpdateMutation,
  createDeleteMutation,
} from "./mutation";

import {
  QueryParameters,
  createCreateRequestFn,
  createGetRequestFn,
  createRemoveRequestFn,
  createSearchRequestFn,
  createUpdateRequestFn,
  createCallRequestFn,
} from "./request";

import { SearchQuery } from "./api";

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
  all!: () => UseQueryResult<Static<TModel, []>[], Error>;
  search!: (query?: SearchQuery) => UseQueryResult<
    {
      results: Static<TModel, []>[];
      total: number;
      offset: number;
      limit: number;
    },
    Error
  >;
  infinite!: (query?: SearchQuery) => UseInfiniteQueryResult<
    InfiniteData<{
      results: Static<TModel, []>[];
      total: number;
      offset: number;
      limit: number;
    }>,
    Error
  >;
  call!: (
    params: QueryParameters,
    options?: QueryOptions<Static<TModel>>
  ) => UseQueryResult<Static<TModel, []>, Error>;
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

const parseSearchQuery = (fields: Required<SearchQuery>["fields"]) =>
  fields.reduce((acc, { name, is, isOneOf, contains }) => {
    if (typeof is !== "undefined") {
      return {
        ...acc,
        [name]: is,
      };
    }
    if (typeof isOneOf !== "undefined") {
      return {
        ...acc,
        [name]: isOneOf.join(","),
      };
    }

    if (typeof contains !== "undefined") {
      return {
        ...acc,
        [name]: `%${contains}%`,
      };
    }

    return acc;
  }, {});

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
      search: (params: SearchQuery = {}) => [name, ...(params ? [params] : [])],
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

    const callQuery = (
      params: QueryParameters,
      options?: QueryOptions<Static<TModel>>
    ) => {
      const fn = createCallRequestFn<TModel>({
        resourcePath,
        token,
      });
      return useQuery({
        queryKey: modelKeys.search(params),
        queryFn: () => fn(params),
        initialData: [],
        ...options,
      });
    };

    const itemQuery = (id: ModelId, options?: QueryOptions<Static<TModel>>) => {
      const fn = createGetRequestFn<TModel>({ resourcePath, token });
      return useQuery<Static<TModel>>({
        queryKey: modelKeys.get(id),
        queryFn: () => fn(id),
        initialData: [],
        ...options,
      });
    };

    const allQuery = () => {
      const fn = createSearchRequestFn<TModel>({
        resourcePath,
        token,
      });
      return useQuery({
        placeholderData: (previousData) => previousData,
        queryKey: modelKeys.search({}),
        queryFn: async () => {
          const { results } = await fn();
          return results;
        },
      });
    };

    const paginatedQuery = ({
      offset = 0,
      limit = 99,
      fields = [],
      orderBy,
    }: SearchQuery = {}) => {
      const fn = createSearchRequestFn<TModel>({
        resourcePath,
        token,
      });
      return useQuery({
        placeholderData: (previousData) => previousData,
        queryKey: modelKeys.search({ offset, limit, orderBy, fields }),
        queryFn: async () => {
          const { results, total } = await fn({
            limit,
            offset,
            orderBy,
            ...parseSearchQuery(fields),
          });
          return { results, total, offset, limit };
        },
      });
    };

    const infiniteQuery = ({
      offset = 0,
      orderBy,
      fields = [],
    }: SearchQuery = {}) => {
      const limit = 99;
      const fn = createSearchRequestFn<TModel>({
        resourcePath,
        token,
      });
      return useInfiniteQuery({
        placeholderData: (previousData) => previousData,
        queryKey: modelKeys.search({ offset, limit, orderBy, fields }),
        queryFn: async () => {
          const { results, total } = await fn({
            limit,
            offset,
            orderBy,
            ...parseSearchQuery(fields),
          });
          return { results, total, offset, limit };
        },
        defaultPageParam: 0,
        getNextPageParam: ({ total, offset, limit }, pages) => {
          const nextOffset = offset + limit;
          if (nextOffset >= total) {
            return undefined;
          }
          return nextOffset;
        },
      });
    };

    const model = new Model({
      schema: schema,
      create: createMutation,
      update: updateMutation,
      remove: removeMutation,
      get: itemQuery,
      call: callQuery,
      all: allQuery,
      search: paginatedQuery,
      infinite: infiniteQuery,
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
