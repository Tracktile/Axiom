import { createRef, MutableRefObject } from "react";
import {
  QueryClient,
  useQuery,
  useMutation,
  UseMutationOptions,
  UseQueryOptions,
  UseInfiniteQueryOptions,
  InfiniteData,
  QueryKey,
} from "@tanstack/react-query";

import {
  Static,
  TSchema,
  Model,
  noAdditionalProperties,
  noEmptyStringValues,
  undefinedToNull,
} from "../common";

import {
  buildResourcePath,
  createCreateRequestFn,
  createGetRequestFn,
  createRemoveRequestFn,
  createSearchRequestFn,
  createUpdateRequestFn,
} from "./request";

import { SearchQuery } from "./api";

type AxiomQueryOptions = {
  offset?: number;
  limit?: number;
  orderBy?: string;
  fields?: SearchQuery["fields"];
};

type AxiomModelMutationOptions<
  TModal extends TSchema,
  TArgs extends TSchema,
> = UseMutationOptions<Static<TModal>, unknown, Static<TArgs>, unknown>;

type TContext<TData = undefined> = { previous?: TData };

interface ModelBindOptions {
  client: QueryClient;
  baseUrl: string;
  token: MutableRefObject<string | null>;
}

export interface ReactModelOptions<
  TModel extends Model<any, any, any, any, any, any, any>,
> {
  model: TModel;
  baseUrl: string;
}

export class ReactModel<
  TModel extends Model<TM, TC, TU, any, any, any, TTransform>,
  TM extends TSchema,
  TC extends TSchema,
  TU extends TSchema,
  TTransform extends (serialized: Static<TModel["schemas"]["model"]>) => any,
> {
  model: TModel;
  client?: QueryClient;
  baseUrl: string;
  token: MutableRefObject<string | null>;

  constructor(options: ReactModelOptions<TModel>) {
    this.model = options.model;
    this.token = createRef<string | null>();
    this.baseUrl = "";
  }

  transform(
    serialized: Static<TModel["schemas"]["model"]>
  ): ReturnType<TTransform> {
    return this.model.transformer(serialized);
  }

  modelKeys = {
    search: (args: SearchQuery = {}) => [
      this.model.name,
      Object.fromEntries(Object.entries(args).filter(([, val]) => !!val)),
    ],
    get: (id: any) => [this.model.name, id],
    create: () => [`create-${this.model.name}`],
    update: () => [`update-${this.model.name}`],
    remove: () => [`delete-${this.model.name}`],
  };

  private bindCreateMutation() {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    this.client.setMutationDefaults(this.modelKeys.create(), {
      mutationFn: (item: Static<TModel["schemas"]["create"]>) => {
        const pruned = undefinedToNull(
          noEmptyStringValues(
            noAdditionalProperties(this.model.schemas.create, item as object)
          )
        );
        return createCreateRequestFn<TModel["schemas"]["model"]>({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
          token: this.token,
        })(pruned);
      },
      onMutate: async (
        item: Static<TModel["schemas"]["model"]>
      ): Promise<TContext<Static<TModel["schemas"]["model"]>>> => {
        if (!this.client) {
          throw new Error("Client is not bound");
        }
        await this.client.cancelQueries({
          queryKey: this.modelKeys.get(item[this.model.idKey]),
        });
        const previous = this.client.getQueryData<
          Static<TModel["schemas"]["model"]>
        >(this.modelKeys.get(item[this.model.idKey]));
        this.client.setQueryData(
          this.modelKeys.get(item[this.model.idKey]),
          item
        );
        this.client.setQueryData<Static<TModel["schemas"]["model"]>>(
          this.modelKeys.get(item[this.model.idKey]),
          () => item
        );
        return { previous };
      },
      onSuccess: (item: Static<TModel["schemas"]["model"]>) => {
        if (!this.client) {
          throw new Error("Client is not bound");
        }
        this.client.invalidateQueries({
          queryKey: this.modelKeys.get(item[this.model.idKey]),
        });
        this.client.invalidateQueries({
          queryKey: this.modelKeys.search(),
        });
      },
      onError: (
        _err: Error,
        item: Static<TModel["schemas"]["model"]>,
        context?: TContext<Static<TModel["schemas"]["model"]>>
      ) => {
        if (!!context?.previous) {
          if (!this.client) {
            throw new Error("Client is not bound");
          }
          this.client.setQueryData(
            this.modelKeys.get(item[this.model.idKey]),
            context.previous
          );
          this.client.setQueryData<Static<TModel["schemas"]["model"]>>(
            this.modelKeys.get(item[this.model.idKey]),
            () => undefined
          );
        }
        this.client?.invalidateQueries({
          queryKey: this.modelKeys.search(),
        });
      },
    });
  }

  bindUpdateMutation() {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    this.client.setMutationDefaults(this.modelKeys.update(), {
      mutationFn: (item: Static<TModel["schemas"]["model"]>) => {
        const id = item[this.model.idKey] as string | number;
        const pruned = undefinedToNull(
          noEmptyStringValues(
            noAdditionalProperties(this.model.schemas.update, item as object)
          )
        );
        return createUpdateRequestFn<TModel["schemas"]["model"]>({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
          token: this.token,
        })(id, pruned);
      },
      onMutate: async (
        item: Static<TModel["schemas"]["model"]>
      ): Promise<TContext<Static<TModel["schemas"]["model"]>>> => {
        if (!this.client) {
          throw new Error("Client is not bound");
        }
        const id = item[this.model.idKey] as string | number;
        await this.client.cancelQueries({
          queryKey: this.modelKeys.get(id),
        });
        const previous = this.client.getQueryData<
          Static<TModel["schemas"]["model"]>
        >(this.modelKeys.get(id));
        this.client.setQueryData(this.modelKeys.get(id), item);
        return { previous };
      },
      onSuccess: () => {
        this.client?.invalidateQueries({
          queryKey: this.modelKeys.search(),
        });
      },
      onError: (
        _err: Error,
        item: Static<TModel["schemas"]["model"]>,
        context?: TContext<Static<TModel["schemas"]["model"]>>
      ) => {
        if (!!context?.previous) {
          if (!this.client) {
            throw new Error("Client is not bound");
          }
          const id = item[this.model.idKey] as string | number;
          this.client.setQueryData(this.modelKeys.get(id), context.previous);
        }
        this.client?.invalidateQueries({
          queryKey: this.modelKeys.search(),
        });
      },
    });
  }

  bindRemoveMutation() {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    this.client.setMutationDefaults(this.modelKeys.remove(), {
      retry: false,
      mutationFn: (item: Static<TModel["schemas"]["model"]>) => {
        const id = item[this.model.idKey] as string | number;
        return createRemoveRequestFn<TModel["schemas"]["model"]>({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
          token: this.token,
        })(id, item);
      },
      onMutate: async (
        item: Static<TModel["schemas"]["model"]>
      ): Promise<TContext<Static<TModel["schemas"]["model"]>>> => {
        if (!this.client) {
          throw new Error("Client is not bound");
        }
        await this.client.cancelQueries({
          queryKey: this.modelKeys.remove(),
        });

        const previous = this.client.getQueryData<
          Static<TModel["schemas"]["model"]>
        >(this.modelKeys.get(item[this.model.idKey]));
        this.client.setQueryData(
          this.modelKeys.get(item[this.model.idKey]),
          null
        );
        return { previous };
      },
      onSuccess: () => {
        this.client?.invalidateQueries({
          queryKey: this.modelKeys.search(),
        });
      },
      onError: (
        _err: Error,
        item: Static<TModel["schemas"]["model"]>,
        context?: TContext<Static<TModel["schemas"]["model"]>>
      ) => {
        if (typeof context?.previous !== "undefined") {
          this.client?.setQueryData(
            this.modelKeys.get(item[this.model.idKey]),
            context.previous
          );
        }
        this.client?.invalidateQueries({
          queryKey: this.modelKeys.search(),
        });
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
    id: string | number = "",
    options?: Partial<
      UseQueryOptions<
        Static<TModel["schemas"]["model"]>,
        Error,
        ReturnType<TTransform>
      >
    >
  ) {
    return useQuery({
      queryKey: this.modelKeys.get(id),
      enabled: !!id,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnMount: true,
      retryOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
      ...options,
      queryFn: () =>
        createGetRequestFn<TModel["schemas"]["model"]>({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
          token: this.token,
        })(id),
      select: (data) => {
        return this.transform(data);
      },
    });
  }

  query(
    { offset, limit = 99, orderBy, fields = [] }: AxiomQueryOptions = {},
    options?: Partial<
      UseQueryOptions<
        {
          results: Static<TModel["schemas"]["model"]>[];
          total: number;
          offset: number | undefined;
          limit: number;
        },
        Error,
        {
          results: ReturnType<TTransform>[];
          total: number;
          offset: number | undefined;
          limit: number;
        }
      >
    >
  ) {
    const query = useQuery({
      queryKey: this.modelKeys.search({
        limit,
        offset,
        orderBy,
        fields,
      }),
      queryFn: async () => {
        const { results, total } = await createSearchRequestFn<
          TModel["schemas"]["model"]
        >({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
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
      },
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnMount: true,
      retryOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
      ...options,
      select: (data) => {
        return {
          ...data,
          results: data.results.map((d) => this.transform(d)),
        };
      },
    });
    return {
      ...query,
      data: query.data?.results ?? [],
      total: query.data?.total ?? 0,
      offset: query.data?.offset ?? 0,
      limit: query.data?.limit ?? 99,
    };
  }

  create(
    options: AxiomModelMutationOptions<
      TModel["schemas"]["model"],
      TModel["schemas"]["create"]
    > = {}
  ) {
    return useMutation<
      Static<TModel["schemas"]["model"]>,
      Error,
      Static<TModel["schemas"]["create"]>
    >({
      mutationKey: this.modelKeys.create(),
      ...options,
    });
  }

  update(
    options: AxiomModelMutationOptions<
      TModel["schemas"]["model"],
      TModel["schemas"]["update"]
    > = {}
  ) {
    return useMutation<
      Static<TModel["schemas"]["model"]>,
      Error,
      Static<TModel["schemas"]["update"]>
    >({
      mutationKey: this.modelKeys.update(),
      ...options,
    });
  }

  remove(
    options: AxiomModelMutationOptions<
      TModel["schemas"]["model"],
      TModel["schemas"]["model"]
    > = {}
  ) {
    return useMutation<
      Static<TModel["schemas"]["model"]>,
      Error,
      Static<TModel["schemas"]["model"]>
    >({
      mutationKey: this.modelKeys.remove(),
      ...options,
    });
  }

  invalidate() {
    this.client?.invalidateQueries({ queryKey: this.modelKeys.search() });
  }

  invalidateById(id: string | number) {
    this.client?.invalidateQueries({ queryKey: this.modelKeys.get(id) });
  }

  read(): Static<TModel["schemas"]["model"]>[] | undefined {
    return this.client?.getQueryData(this.modelKeys.search());
  }

  readOne(
    id: keyof Static<TModel["schemas"]["model"]>
  ): Static<TModel["schemas"]["model"]> | undefined {
    return this.client?.getQueryData(this.modelKeys.get(id));
  }
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
