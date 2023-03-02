import {
  QueryClient,
  useQuery,
  UseQueryResult,
  UseMutationResult,
  MutationOptions,
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
  createSearchRequestFn,
  createUpdateRequestFn,
  ApiPaginationParams,
} from "./request";

export type ModelId = string | number;

export type ModelFactory<T extends TSchema> = (client: QueryClient) => Model<T>;

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
  remove!: () => UseMutationResult<
    Static<TModel>,
    unknown,
    Static<TModel>,
    unknown
  >;
  get!: (id: ModelId) => UseQueryResult<Static<TModel>, unknown>;
  search!: (
    params?: ApiPaginationParams
  ) => UseQueryResult<Static<TModel>[], unknown>;
  invalidateOne!: (id: ModelId) => Promise<void>;
  invalidateAll!: () => Promise<void>;
  read!: (id: ModelId) => TModel | undefined;
  readAll!: () => TModel[] | undefined;
  readOneFromAll!: (id: ModelId) => TModel | undefined;
  constructor(model: Model<TModel>) {
    Object.assign(this, model);
  }
}

interface CreateApiModelOptions<Schema extends TSchema> {
  name: string;
  resource: string;
  schema: Schema;
  idKey?: keyof Static<Schema> | "id";
}

export function createApiModel<TModel extends TSchema>({
  name,
  resource,
  schema,
  idKey = "id",
}: CreateApiModelOptions<TModel>): ModelFactory<TModel> & { schema: TModel } {
  const factoryFn = (client: QueryClient): Model<TModel> => {
    const modelKeys = {
      search: (params?: ApiPaginationParams) => [
        name,
        ...(params ? [params] : []),
      ],
      get: (id: ModelId) => [name, id],
    };

    const createMutation = createCreateMutation<TModel>(name, {
      client,
      idKey,
      createFn: createCreateRequestFn<TModel>(resource),
      itemCacheKey: modelKeys.get,
      itemIndexCacheKey: modelKeys.search,
    });

    const updateMutation = createUpdateMutation<TModel>(name, {
      client,
      idKey,
      updateFn: createUpdateRequestFn<TModel>(resource, idKey),
      itemCacheKey: modelKeys.get,
      itemIndexCacheKey: modelKeys.search,
    });

    const removeMutation = createDeleteMutation<TModel>(name, {
      client,
      idKey,
      deleteFn: createRemoveRequestFn<TModel>(resource),
      itemCacheKey: modelKeys.get,
      itemIndexCacheKey: modelKeys.search,
    });

    const itemQuery = (id: ModelId) => {
      const fn = createGetRequestFn<TModel>(resource);
      return useQuery<Static<TModel>>(modelKeys.get(id), () => fn(id), {});
    };

    const searchQuery = (params?: ApiPaginationParams) => {
      const fn = createSearchRequestFn<TModel>(resource);
      return useQuery<Static<TModel>[]>(modelKeys.search(params), () => fn());
    };

    const model: Model<TModel> = new Model({
      schema: schema,
      create: createMutation,
      update: updateMutation,
      remove: removeMutation,
      get: itemQuery,
      search: searchQuery,
      invalidateOne: (id: ModelId) =>
        client.invalidateQueries(modelKeys.get(id)),
      invalidateAll: () => client.invalidateQueries(modelKeys.search()),
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
