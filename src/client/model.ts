import {
  QueryClient,
  useQuery,
  useMutation,
  UseMutationOptions,
  UseQueryOptions,
  keepPreviousData,
} from "@tanstack/react-query";
import { createRef, MutableRefObject, useMemo } from "react";

import { SearchQuery } from "./api";
import {
  buildResourcePath,
  createCreateRequestFn,
  createGetRequestFn,
  createRemoveRequestFn,
  createSearchRequestFn,
  createUpdateRequestFn,
} from "./request";
import {
  APIError,
  Static,
  TSchema,
  Model,
  noAdditionalProperties,
  noEmptyStringValues,
  undefinedToNull,
} from "../common";

export type AnyQueryResult = ReturnType<
  ReactModel<any, any, any, any, any>["query" | "get"]
>;

export type AnyMutationResult = ReturnType<
  ReactModel<any, any, any, any, any>["update" | "create" | "remove"]
>;

type AxiomGetOptions = {
  id?: string;
  fields?: SearchQuery["fields"];
  path?: Record<string, string | number>;
};

type AxiomQueryOptions = {
  offset?: number;
  limit?: number;
  orderBy?: string;
  fields?: SearchQuery["fields"];
  comparator?: "and" | "or";
  path?: Record<string, string | number>;
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
    search: (args: SearchQuery & { path?: Record<string, unknown> } = {}) => [
      this.model.name,
      args,
    ],
    get: (id: any) => [this.model.name, id],
    create: () => [`create-${this.model.name}`],
    update: () => [`update-${this.model.name}`],
    remove: () => [`delete-${this.model.name}`],
  };

  private preparePayloadForSubmission(schema: TSchema, payload: object) {
    const pruned = undefinedToNull(
      noEmptyStringValues(noAdditionalProperties(schema, payload))
    );
    return pruned;
  }

  private bindCreateMutation() {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    this.client.setMutationDefaults(this.modelKeys.create(), {
      mutationFn: (item: Static<TModel["schemas"]["create"]>) => {
        const pruned = this.preparePayloadForSubmission(
          this.model.schemas.create,
          item as object
        );
        return createCreateRequestFn<TModel["schemas"]["model"]>({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
          token: this.token,
        })(pruned);
      },
      onMutate: async (
        item: Static<TModel["schemas"]["create"]>
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
        err: APIError,
        item: Static<TModel["schemas"]["model"]>,
        context?: TContext<Static<TModel["schemas"]["model"]>>
      ) => {
        if (err) {
          console.log(err);
        }
        if (context?.previous) {
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
      mutationFn: (item: Static<TModel["schemas"]["update"]>) => {
        const id = item[this.model.idKey] as string | number;
        const pruned = this.preparePayloadForSubmission(
          this.model.schemas.update,
          item as object
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
        err: APIError,
        item: Static<TModel["schemas"]["model"]>,
        context?: TContext<Static<TModel["schemas"]["model"]>>
      ) => {
        if (err) {
          console.log(err);
        }
        if (context?.previous) {
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
        err: APIError,
        item: Static<TModel["schemas"]["model"]>,
        context?: TContext<Static<TModel["schemas"]["model"]>>
      ) => {
        if (err) {
          console.log(err);
        }
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
    { id = "", fields = [], path = {} }: AxiomGetOptions = {
      id: "",
      fields: [],
      path: {},
    },
    options?: Partial<
      UseQueryOptions<
        Static<TModel["schemas"]["model"]>,
        APIError,
        ReturnType<TTransform>
      >
    >
  ) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const query = useQuery({
      queryKey: [...this.modelKeys.get(id), path],
      enabled: options?.enabled !== false,
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
          resourcePath: buildResourcePath(
            this.baseUrl,
            this.model.resource,
            path
          ),
          token: this.token,
        })(id, parseSearchQuery(fields)),
      select: (data) => this.transform(data),
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ret = useMemo(
      () => ({ ...query, isUpdating: query.isLoading || query.isFetching }),
      [query]
    );
    return ret;
  }

  query(
    {
      offset,
      limit = 99,
      orderBy,
      fields = [],
      comparator = "or",
      path,
    }: AxiomQueryOptions = {},
    options?: Partial<
      UseQueryOptions<
        {
          results: Static<TModel["schemas"]["model"]>[];
          total: number;
          offset: number | undefined;
          limit: number;
        },
        APIError,
        {
          results: ReturnType<TTransform>[];
          total: number;
          offset: number | undefined;
          limit: number;
        }
      >
    >
  ) {
    const queryKey = this.modelKeys.search({
      limit,
      offset,
      orderBy,
      fields,
      path,
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const query = useQuery({
      queryKey,
      queryFn: async () => {
        const searchQuery = parseSearchQuery(fields);
        const { results, total } = await createSearchRequestFn<
          TModel["schemas"]["model"]
        >({
          resourcePath: buildResourcePath(
            this.baseUrl,
            this.model.resource,
            path
          ),
          token: this.token,
          headers: {
            "X-Pagination-Fieldoperator": comparator,
          },
        })({
          limit,
          offset,
          orderBy,
          ...searchQuery,
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
      placeholderData: keepPreviousData,
      ...options,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      select: (data: {
        results: Static<TModel["schemas"]["model"]>[];
        total: number;
        offset?: number;
        limit: number;
      }) => {
        return Object.assign(data, {
          results: data.results.map((d) => this.transform(d)),
        });
      },
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ret = useMemo(() => {
      return {
        ...query,
        data: query.data?.results ?? [],
        total: query.data?.total ?? 0,
        offset: query.data?.offset ?? 0,
        limit: query.data?.limit ?? 99,
        isUpdating: query.isLoading || query.isFetching,
      };
    }, [query]);
    return ret;
  }

  create(
    options: AxiomModelMutationOptions<
      TModel["schemas"]["model"],
      TModel["schemas"]["create"]
    > = {}
  ) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMutation<
      Static<TModel["schemas"]["model"]>,
      APIError,
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMutation<
      Static<TModel["schemas"]["model"]>,
      APIError,
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMutation<
      Static<TModel["schemas"]["model"]>,
      APIError,
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

  readOne(id: string | number): Static<TModel["schemas"]["model"]> | undefined {
    return this.client?.getQueryData(this.modelKeys.get(id));
  }
}

export type PaginationParams = {
  offset?: number;
  limit?: number;
  orderBy?: string;
};

const parseSearchQuery = (fields: Required<SearchQuery>["fields"]) =>
  fields.reduce(
    (
      acc,
      {
        name,
        comparator,
        is,
        isOneOf,
        isLikeOneOf,
        contains,
        isGreaterThan,
        isLessThan,
      }
    ) => {
      if (typeof is !== "undefined") {
        return {
          ...acc,
          [name]: comparator ? `${comparator}:${is}` : is,
        };
      }
      if (typeof isOneOf !== "undefined") {
        return {
          ...acc,
          [name]: comparator
            ? `${comparator}:${isOneOf.join(",")}`
            : isOneOf.join(","),
        };
      }

      if (typeof contains !== "undefined") {
        return {
          ...acc,
          [name]: comparator ? `${comparator}:%${contains}%` : `%${contains}%`,
        };
      }

      if (typeof isLikeOneOf !== "undefined") {
        return {
          ...acc,
          [name]: comparator
            ? `${comparator}:${isLikeOneOf.map((v) => `%${v}%`).join(",")}`
            : isLikeOneOf.map((v) => `%${v}%`).join(","),
        };
      }

      if (typeof isGreaterThan !== "undefined") {
        return {
          ...acc,
          [name]: comparator
            ? `${comparator}:>${isGreaterThan}`
            : `>${isGreaterThan}`,
        };
      }

      if (typeof isLessThan !== "undefined") {
        return {
          ...acc,
          [name]: comparator
            ? `${comparator}:<${isLessThan}`
            : `<${isLessThan}`,
        };
      }

      return acc;
    },
    {}
  );
