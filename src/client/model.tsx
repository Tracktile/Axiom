import { createRef, MutableRefObject } from "react";
import {
  QueryClient,
  useQuery,
  useInfiniteQuery,
  UseQueryResult,
  UseMutationResult,
  useMutation,
  UseMutationOptions,
  UseQueryOptions,
  DefinedUseInfiniteQueryResult,
} from "@tanstack/react-query";
import { TSchema, Static } from "@sinclair/typebox";

import {
  buildResourcePath,
  createCreateRequestFn,
  createGetRequestFn,
  createRemoveRequestFn,
  createSearchRequestFn,
  createUpdateRequestFn,
} from "./request";

import { SearchQuery } from "./api";
import { DefinedInitialDataInfiniteOptions } from "@tanstack/react-query/build/legacy/infiniteQueryOptions";

type AxiomQueryOptions = {
  offset?: number;
  limit?: number;
  orderBy?: string;
  fields?: SearchQuery["fields"];
};

type AxiomModelGetOptions<TModel extends TSchema> = UseQueryOptions<
  Static<TModel>,
  Error
>;

type AxiomModelQueryOptions<TModel extends TSchema> =
  DefinedInitialDataInfiniteOptions<
    {
      results: Static<TModel>[];
      total: number;
      offset: number;
      limit: number;
    },
    Error
  >;

type AxiomModelGetResult<TModel extends TSchema> = UseQueryResult<
  Static<TModel>,
  Error
>;

type AxiomModelQueryResult<TModel extends TSchema> =
  DefinedUseInfiniteQueryResult<Static<TModel>, Error>;

type AxiomModelMutationOptions<
  TModal extends TSchema,
  TArgs extends TSchema,
> = UseMutationOptions<Static<TModal>, unknown, Static<TArgs>, unknown>;

type AxiomModelMutationResult<
  TModal extends TSchema,
  TArgs extends TSchema,
> = UseMutationResult<Static<TModal>, unknown, Static<TArgs>, unknown>;

export type ModelId = string | number;

type TContext<TData = undefined> = { previous?: TData };

interface ModelBindOptions {
  client: QueryClient;
  baseUrl: string;
  token: MutableRefObject<string | null>;
}

export interface ModelOptions<
  TResourceParams extends TSchema,
  TQueryParams extends TSchema,
  TModel extends TSchema,
  TCreate extends TSchema,
  TUpdate extends TSchema,
> {
  name: string;
  resource: string;
  params: TResourceParams;
  query: TQueryParams;
  model: TModel;
  create: TCreate;
  update: TUpdate;
  idKey: keyof Static<TModel>;
}

export class Model<
  TResourceParams extends TSchema,
  TQueryParams extends TSchema,
  TModel extends TSchema,
  TCreate extends TSchema,
  TUpdate extends TSchema,
> {
  name: string;
  resource: string;
  idKey: keyof Static<TModel>;
  schemas: {
    create: TCreate;
    update: TUpdate;
    resource: TResourceParams;
    query: TQueryParams;
    model: TModel;
  };
  client?: QueryClient;
  baseUrl: string;
  token: MutableRefObject<string | null>;

  constructor(
    options: ModelOptions<
      TResourceParams,
      TQueryParams,
      TModel,
      TCreate,
      TUpdate
    >
  ) {
    this.name = options.name;
    this.resource = options.resource;
    this.idKey = options.idKey ?? ("id" as keyof Static<TModel>);
    this.token = createRef<string | null>();
    this.schemas = {
      create: options.create,
      update: options.update,
      resource: options.params,
      query: options.query,
      model: options.model,
    };
    this.baseUrl = "";
  }

  modelKeys = {
    search: (params: SearchQuery = {}) => [
      this.name,
      ...(params ? [params] : []),
    ],
    get: (id: ModelId) => [this.name, id],
    create: () => [this.name, "create"],
    update: (id?: ModelId) => [this.name, id, "update"],
    remove: (id?: ModelId) => [this.name, id, "remove"],
  };

  private bindCreateMutation() {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    this.client.setMutationDefaults(this.modelKeys.create(), {
      mutationFn: (item: Static<TCreate>) => {
        return createCreateRequestFn<TModel>({
          resourcePath: buildResourcePath(this.baseUrl, this.resource),
          token: this.token,
        })(item);
      },
      onMutate: async (
        item: Static<TModel>
      ): Promise<TContext<Static<TModel>>> => {
        if (!this.client) {
          throw new Error("Client is not bound");
        }
        await this.client.cancelQueries({
          queryKey: this.modelKeys.get(
            (item as Record<string, ModelId>)[this.idKey] as ModelId
          ),
        });
        const previous = this.client.getQueryData<Static<TModel>>(
          this.modelKeys.get(
            (item as Record<string, ModelId>)[this.idKey] as ModelId
          )
        );
        this.client.setQueryData(
          this.modelKeys.get(
            (item as Record<string, ModelId>)[this.idKey] as ModelId
          ),
          item
        );
        this.client.setQueryData<Static<TModel>>(
          this.modelKeys.get(item[this.idKey] as ModelId),
          () => item
        );
        return { previous };
      },
      onSuccess: (item: Static<TModel>) => {
        if (!this.client) {
          throw new Error("Client is not bound");
        }
        this.client.invalidateQueries({
          queryKey: this.modelKeys.get(item[this.idKey] as ModelId),
        });
      },
      onError: (
        _err: Error,
        item: Static<TModel>,
        context?: TContext<Static<TModel>>
      ) => {
        if (!!context?.previous) {
          if (!this.client) {
            throw new Error("Client is not bound");
          }
          this.client.setQueryData(
            this.modelKeys.get(
              (item as Record<string, ModelId>)[this.idKey] as ModelId
            ),
            context.previous
          );
          this.client.setQueryData<Static<TModel>>(
            this.modelKeys.get(item[this.idKey] as ModelId),
            () => undefined
          );
        }
      },
    });
  }

  bindUpdateMutation() {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    this.client.setMutationDefaults(this.modelKeys.update(), {
      mutationFn: (
        item: Static<TModel> & { id: "id" | keyof Static<TModel, []> }
      ) => {
        return createUpdateRequestFn<TModel>({
          resourcePath: buildResourcePath(this.baseUrl, this.resource),
          idKey: this.idKey,
          token: this.token,
        })(item);
      },
      onMutate: async (
        item: Static<TModel>
      ): Promise<TContext<Static<TModel>>> => {
        if (!this.client) {
          throw new Error("Client is not bound");
        }
        await this.client.cancelQueries({
          queryKey: this.modelKeys.get(
            (item as Record<string, ModelId>)[this.idKey] as ModelId
          ),
        });
        const previous = this.client.getQueryData<Static<TModel>>(
          this.modelKeys.get(
            (item as Record<string, ModelId>)[this.idKey] as ModelId
          )
        );
        this.client.setQueryData(
          this.modelKeys.get(
            (item as Record<string, ModelId>)[this.idKey] as ModelId
          ),
          item
        );
        return { previous };
      },
      onSuccess: () => {},
      onError: (
        _err: Error,
        item: Static<TModel>,
        context?: TContext<Static<TModel>>
      ) => {
        if (!!context?.previous) {
          if (!this.client) {
            throw new Error("Client is not bound");
          }
          this.client.setQueryData(
            this.modelKeys.get(
              (item as Record<string, ModelId>)[this.idKey] as ModelId
            ),
            context.previous
          );
        }
      },
    });
  }

  bindRemoveMutation() {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    this.client.setMutationDefaults(this.modelKeys.remove(), {
      retry: false,
      mutationFn: (item: Static<TModel> & { id: ModelId }) =>
        createRemoveRequestFn({
          resourcePath: buildResourcePath(this.baseUrl, this.resource),
          token: this.token,
        })(item),
      onMutate: async (
        item: Static<TModel>
      ): Promise<TContext<Static<TModel>>> => {
        if (!this.client) {
          throw new Error("Client is not bound");
        }
        await this.client.cancelQueries({
          queryKey: this.modelKeys.remove(
            (item as Record<string, ModelId>)[this.idKey] as ModelId
          ),
        });

        const previous = this.client.getQueryData<Static<TModel>>(
          this.modelKeys.get(
            (item as Record<string, ModelId>)[this.idKey] as ModelId
          )
        );
        this.client.setQueryData(
          this.modelKeys.get(
            (item as Record<string, ModelId>)[this.idKey] as ModelId
          ),
          null
        );
        return { previous };
      },
      onSuccess: () => {},
      onError: (
        _err: Error,
        item: Static<TModel>,
        context?: TContext<Static<TModel>>
      ) => {
        if (typeof context?.previous !== "undefined") {
          if (!this.client) {
            throw new Error("Client is not bound");
          }
          this.client.setQueryData(
            this.modelKeys.get(
              (item as Record<string, ModelId>)[this.idKey] as ModelId
            ),
            context.previous
          );
        }
      },
    });
  }

  bind({ client, baseUrl, token }: ModelBindOptions) {
    this.client = client;
    this.baseUrl = baseUrl;
    this.token = token;
    this.bindCreateMutation();
    this.bindUpdateMutation();
    this.bindRemoveMutation();
    return this;
  }

  get(
    id: ModelId,
    options: Partial<AxiomModelGetOptions<TModel>> = {}
  ): AxiomModelGetResult<TModel> {
    return useQuery<Static<TModel>>({
      ...options,
      queryKey: this.modelKeys.get(id),
      enabled: !!id,
      queryFn: () =>
        createGetRequestFn<TModel>({
          resourcePath: buildResourcePath(this.baseUrl, this.resource),
          token: this.token,
        })(id),
      initialData: [] as Static<TModel>[] & undefined,
    });
  }

  query({
    offset: offsetArg,
    limit = 99,
    orderBy,
    fields = [],
  }: AxiomQueryOptions = {}) {
    const queryFn = async ({ pageParam = 0 }) => {
      const offset = offsetArg ?? (pageParam as number);

      const { results, total } = await createSearchRequestFn<TModel>({
        resourcePath: buildResourcePath(this.baseUrl, this.resource),
        token: this.token,
      })({
        limit,
        offset,
        orderBy,
        ...parseSearchQuery(fields),
      });
      return {
        results,
        total,
        offset,
        limit,
      };
    };

    const query = useInfiniteQuery({
      queryKey: this.modelKeys.search({
        orderBy,
        fields,
      }),
      queryFn,
      initialData: {
        pages: [],
        pageParams: [],
      },
      defaultPageParam: 0,
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        return (lastPage?.offset ?? 0) + lastPage?.results?.length ?? 0;
      },
      getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
        return (firstPage?.offset ?? 0) - firstPage?.results?.length ?? 0;
      },
    });
    const { data, ...queryResult } = query;
    return {
      ...queryResult,
      data: data?.pages.map((page) => page.results).flat() ?? [],
      pages: data.pages,
    };
  }

  create(options: AxiomModelMutationOptions<TModel, TCreate> = {}) {
    return useMutation<Static<TModel>, unknown, Static<TCreate>>({
      mutationKey: this.modelKeys.create(),
      ...options,
    });
  }

  update(
    id: ModelId,
    options: AxiomModelMutationOptions<TModel, TUpdate> = {}
  ) {
    return useMutation<Static<TModel>, unknown, Static<TUpdate>>({
      mutationKey: this.modelKeys.update(),
      ...options,
    });
  }

  remove(id: ModelId, options: AxiomModelMutationOptions<TModel, TModel> = {}) {
    return useMutation<Static<TModel>, unknown, Static<TModel>>({
      mutationKey: this.modelKeys.remove(),
      ...options,
    });
  }

  invalidate() {}

  invalidateById(id: ModelId) {}

  invalidateWhere(fn: (model: TModel) => boolean) {}
}

export type PaginationParams = {
  offset?: number;
  limit?: number;
  orderBy?: string;
};

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

interface CreateApiModelOptions<
  TResourceParams extends TSchema,
  TQueryParams extends TSchema,
  TModel extends TSchema,
  TCreate extends TSchema,
  TUpdate extends TSchema,
> {
  name: string;
  resource: string;
  params: TResourceParams;
  query: TQueryParams;
  model: TModel;
  create: TCreate;
  update: TUpdate;
  idKey: keyof Static<TModel>;
}

export function createModel<
  TResourceParams extends TSchema,
  TQueryParams extends TSchema,
  TModel extends TSchema,
  TCreate extends TSchema,
  TUpdate extends TSchema,
>({
  name,
  resource,
  params,
  model,
  create,
  update,
  query,
  idKey = "id" as keyof Static<TModel>,
}: CreateApiModelOptions<
  TResourceParams,
  TQueryParams,
  TModel,
  TCreate,
  TUpdate
>) {
  return new Model<TResourceParams, TQueryParams, TModel, TCreate, TUpdate>({
    name,
    resource,
    params,
    query,
    model,
    create,
    update,
    idKey,
  });
}
