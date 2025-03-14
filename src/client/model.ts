import {
  QueryClient,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { get, reverse, sortBy } from "lodash";
import { createRef, MutableRefObject, useCallback, useMemo } from "react";
import {
  APIError,
  encodeSearchQuery,
  Model,
  noAdditionalProperties,
  noEmptyStringValues,
  OrderBy,
  SearchParams,
  SearchQuery,
  SearchQueryField,
  SearchQueryResult,
  SearchResponse,
  Static,
  TSchema,
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

export type AnyQueryResult = ReturnType<
  ReactModel<any, any, any, any, any, any>["query" | "get"]
>;

export type AnyMutationResult = ReturnType<
  ReactModel<any, any, any, any, any, any>["update" | "create" | "remove"]
>;

type AxiomGetOptions<TSortable> = {
  id?: string;
  fields?: SearchQuery<TSortable>["fields"];
  path?: Record<string, string | number>;
};

type AxiomQueryOptions<TSortable> = {
  offset?: number;
  limit?: number;
  orderBy?: string | OrderBy<TSortable>;
  fields?: SearchQuery<TSortable>["fields"];
  comparator?: "and" | "or";
  path?: Record<string, string | number>;
  staleTime?: number;
};

type AxiomModelMutationOptions<
  TModal extends TSchema,
  TArgs extends TSchema,
> = UseMutationOptions<
  Static<TModal>,
  unknown,
  Static<TArgs>,
  TContext<Static<TModal>>
>;

type TContext<TData = undefined> = { previous?: TData };

interface ModelBindOptions {
  client: QueryClient;
  baseUrl: string;
  token: MutableRefObject<string | null>;
}

type CachedCursors = Record<number, { next?: string; prev?: string }>;

export interface ReactModelOptions<
  TModel extends Model<TM, TC, TU, any, any, any, TTransform, TSortable>,
  TM extends TSchema,
  TC extends TSchema,
  TU extends TSchema,
  TTransform extends (serialized: Static<TModel["schemas"]["model"]>) => any,
  TSortable extends TSchema = TM,
> {
  model: TModel;
  baseUrl: string;
  _unstable_offlineModel?: boolean;
}

export class ReactModel<
  TModel extends Model<TM, TC, TU, any, any, any, TTransform, TSortable>,
  TM extends TSchema,
  TC extends TSchema,
  TU extends TSchema,
  TTransform extends (serialized: Static<TModel["schemas"]["model"]>) => any,
  TSortable extends TSchema = TM,
> {
  model: TModel;
  client?: QueryClient;
  baseUrl: string;
  token: MutableRefObject<string | null>;
  staleTime: number;
  gcTime: number;
  _unstable_offlineModel?: boolean;

  constructor(
    options: ReactModelOptions<TModel, TM, TC, TU, TTransform, TSortable>
  ) {
    this.model = options.model;
    this.token = createRef<string | null>();
    this.baseUrl = "";
    this.staleTime = options.model.staleTime || 0;
    this.gcTime = options.model.gcTime || 0;
    this._unstable_offlineModel = options._unstable_offlineModel ?? false;
  }

  modelKeys = {
    get: (id: string) => ["get", this.model.name, id],
    search: () => ["search", this.model.name],
    searchBy: (
      args: SearchQuery<TSortable> & { path?: Record<string, unknown> },
      append?: string
    ) => ["search", this.model.name, args, ...(append ? [append] : [])],
    create: () => ["create", this.model.name],
    update: () => ["update", this.model.name],
    remove: () => ["delete", this.model.name],
  };

  transform(
    serialized: Static<TModel["schemas"]["model"]>
  ): ReturnType<TTransform> {
    return this.model.transformer(serialized);
  }

  private initializeCache() {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    const current = this.client.getQueryData<
      SearchQueryResult<Static<TModel["schemas"]["model"]>>
    >(this.modelKeys.search());

    if (Array.isArray(current?.results)) {
      this.sync(current.results);
    } else {
      this.client.setQueryData(this.modelKeys.search(), {
        results: [],
        total: 0,
        offset: 0,
        limit: 99,
      });
    }
  }

  private sync(
    input:
      | Static<TModel["schemas"]["model"]>
      | Static<TModel["schemas"]["model"]>[]
  ) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }

    if (!this._unstable_offlineModel) {
      return;
    }

    const searchQueries = this.client.getQueriesData<
      SearchQueryResult<Static<TModel["schemas"]["model"]>>
    >({ queryKey: this.modelKeys.search() });

    const items = Array.isArray(input) ? input : [input];

    for (const [key, current] of searchQueries) {
      if (!current) {
        continue;
      }

      const itemsToUpdate = items.filter((item) =>
        current.results.some(
          (i) => i[this.model.idKey] === item[this.model.idKey]
        )
      );
      const itemsToAdd = items.filter(
        (item) =>
          !current.results.some(
            (i) => i[this.model.idKey] === item[this.model.idKey]
          )
      );

      this.client.setQueryData<
        SearchQueryResult<Static<TModel["schemas"]["model"]>>
      >(key, {
        ...current,
        results: [
          ...current.results.map((i) => {
            if (
              itemsToUpdate.some(
                (item) => item[this.model.idKey] === i[this.model.idKey]
              )
            ) {
              return itemsToUpdate.find(
                (item) => item[this.model.idKey] === i[this.model.idKey]
              );
            }
            return i;
          }),
          ...itemsToAdd,
        ],
      });
    }

    this.client.setQueriesData<Static<TModel["schemas"]["model"]>>(
      {
        queryKey: ["get", this.model.name],
      },
      (current) => {
        return items.find(
          (item) => item[this.model.idKey] === current?.[this.model.idKey]
        );
      }
    );
  }

  private async destroy(id: string) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }

    if (!this._unstable_offlineModel) {
      return;
    }

    await Promise.all([
      this.client.cancelQueries({
        queryKey: this.modelKeys.get(id),
      }),
      this.client.cancelQueries({
        queryKey: this.modelKeys.search(),
      }),
    ]);

    const searchQueries = this.client.getQueriesData<
      SearchQueryResult<Static<TModel["schemas"]["model"]>>
    >({ queryKey: this.modelKeys.search() });

    for (const key of searchQueries) {
      const current = this.client.getQueryData<
        SearchQueryResult<Static<TModel["schemas"]["model"]>>
      >(key) ?? { results: [], total: 0, offset: 0, limit: 99 };
      this.client.setQueryData<
        SearchQueryResult<Static<TModel["schemas"]["model"]>>
      >(key, {
        ...current,
        results: current.results.filter(
          (item) => item[this.model.idKey] !== id
        ),
      });
    }

    this.client.setQueryData(this.modelKeys.get(id), null);
  }

  private getInitialSearchData({
    limit = 99,
    offset = 0,
    orderBy,
    fields = [],
  }: AxiomQueryOptions<TSortable>) {
    if (!this._unstable_offlineModel) {
      return undefined;
    }
    const collection = this.client?.getQueryData<
      SearchQueryResult<Static<TModel["schemas"]["model"]>>
    >(this.modelKeys.search());

    function matchesFields(fields: SearchQueryField[]) {
      return (item: Static<TModel["schemas"]["model"]>) => {
        return fields.some((field) => {
          const fieldValue = get(item, field.name) as string | number | boolean;
          const compareValue =
            typeof fieldValue === "string"
              ? fieldValue.toLowerCase()
              : fieldValue;
          if (field.is) {
            return String(compareValue) === String(field.is).toLowerCase();
          }
          if (field.isOneOf) {
            return field.isOneOf.some((is) => is === compareValue);
          }
          if (field.contains) {
            return String(compareValue).includes(
              String(field.contains).toLowerCase()
            );
          }
          if (field.isLikeOneOf) {
            return field.isLikeOneOf.some(
              (like) =>
                String(compareValue).includes(String(like).toLowerCase()) &&
                String(compareValue).includes(String(like).toLowerCase())
            );
          }
          if (field.isGreaterThan) {
            return compareValue > field.isGreaterThan;
          }
          if (field.isLessThan) {
            return compareValue < field.isLessThan;
          }
          if (field.isBetween) {
            return (
              compareValue >= field.isBetween[0] &&
              compareValue <= field.isBetween[1]
            );
          }

          return false;
        });
      };
    }

    let results = collection?.results.filter(matchesFields(fields)) ?? [];
    const { key, order } =
      typeof orderBy === "string" ? JSON.parse(orderBy ?? "{}") : orderBy;

    if (key) {
      results = sortBy(results, [key]);
    }

    if (order === "desc") {
      results = reverse(results);
    }

    results = results.slice(offset, offset + limit);

    return {
      results,
      total: results.length,
      offset,
      limit,
    };
  }

  private preparePayloadForSubmission(schema: TSchema, payload: object) {
    const pruned = undefinedToNull(
      noEmptyStringValues(noAdditionalProperties(schema, payload))
    );
    return pruned;
  }

  private async defaultCreateOnMutate(
    item: Static<TModel["schemas"]["create"]>
  ) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }

    await Promise.all([
      this.client.cancelQueries({
        queryKey: this.modelKeys.get(String(item[this.model.idKey])),
      }),
      this.client.cancelQueries({
        queryKey: this.modelKeys.search(),
      }),
    ]);

    const previous = this.client.getQueryData<
      Static<TModel["schemas"]["model"]>
    >(this.modelKeys.get(String(item[this.model.idKey])));

    this.sync(item);

    return { previous };
  }

  private defaultCreateOnSuccess() {
    this.client?.invalidateQueries({
      queryKey: this.modelKeys.search(),
    });
  }

  private defaultCreateOnError(
    err: APIError,
    item: Static<TModel["schemas"]["model"]>,
    context?: TContext<Static<TModel["schemas"]["model"]>>
  ) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    if (context?.previous) {
      this.destroy(String(item[this.model.idKey]));
    }
    this.client.invalidateQueries({
      queryKey: this.modelKeys.search(),
    });
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
      onMutate: this.defaultCreateOnMutate.bind(this),
      onSuccess: this.defaultCreateOnSuccess.bind(this),
      onError: this.defaultCreateOnError.bind(this),
    });
  }

  private cacheCursor(
    commonArgs: Record<string, unknown>,
    offset: number,
    limit: number,
    next?: string,
    prev?: string
  ) {
    if (next || prev) {
      const key = this.modelKeys.searchBy(commonArgs, "cursors");
      const cursors: CachedCursors = this.client?.getQueryData(key) || {};
      if (next) {
        cursors[offset + limit] = { next, prev: cursors[offset + limit]?.prev };
        this.client?.setQueryData(key, cursors);
      }
      if (prev) {
        cursors[offset - limit] = { prev, next: cursors[offset - limit]?.next };
        this.client?.setQueryData(key, cursors);
      }
    }
  }

  private getCursor(
    commonArgs: Record<string, unknown>,
    offset: number
  ): {
    next?: string;
    prev?: string;
    knownCursors?: { [offset: number]: string };
  } {
    const key = this.modelKeys.searchBy(commonArgs, "cursors");
    const cursors: CachedCursors = this.client?.getQueryData(key) || {};
    let knownCursors = undefined;
    if (!cursors[offset]?.next) {
      const entries = Object.entries(cursors);
      const { bestOffset, bestNext } = entries.reduce<{
        bestOffset: number;
        bestNext: string;
      }>(
        (acc, [curOffset, { next }]) => {
          if (+curOffset > acc.bestOffset && +curOffset < offset) {
            return { bestOffset: +curOffset, bestNext: next || "" };
          }
          return acc;
        },
        { bestOffset: -1, bestNext: "" }
      );
      if (bestNext) {
        knownCursors = { [bestOffset]: bestNext };
      }
    }
    return { knownCursors, ...(cursors[offset] || {}) };
  }

  private async defaultUpdateOnMutate(
    item: Static<TModel["schemas"]["model"]>
  ): Promise<TContext<Static<TModel["schemas"]["model"]>>> {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    await Promise.all([
      this.client.cancelQueries({
        queryKey: this.modelKeys.get(String(item[this.model.idKey])),
      }),
      this.client.cancelQueries({
        queryKey: this.modelKeys.search(),
      }),
    ]);

    const previous = this.client.getQueryData<
      Static<TModel["schemas"]["model"]>
    >(this.modelKeys.get(String(item[this.model.idKey])));

    if (previous) {
      this.sync(Object.assign(previous, item));
    } else {
      this.sync(item);
    }

    return { previous };
  }

  private defaultUpdateOnSuccess() {
    this.client?.invalidateQueries({
      queryKey: this.modelKeys.search(),
    });
  }

  private defaultUpdateOnError(
    err: APIError,
    _item: Static<TModel["schemas"]["model"]>,
    context?: TContext<Static<TModel["schemas"]["model"]>>
  ) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    if (context?.previous) {
      this.sync(context.previous);
    }
    this.client?.invalidateQueries({
      queryKey: this.modelKeys.search(),
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
      onMutate: this.defaultUpdateOnMutate.bind(this),
      onSuccess: this.defaultUpdateOnSuccess.bind(this),
      onError: this.defaultUpdateOnError.bind(this),
    });
  }

  private async defaultRemoveOnMutate(
    item: Static<TModel["schemas"]["model"]>
  ): Promise<TContext<Static<TModel["schemas"]["model"]>>> {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    await this.client.cancelQueries({
      queryKey: this.modelKeys.search(),
    });

    const previous = this.client.getQueryData<
      Static<TModel["schemas"]["model"]>
    >(this.modelKeys.get(String(item[this.model.idKey])));

    this.destroy(String(item[this.model.idKey]));

    this.client.setQueryData(
      this.modelKeys.get(String(item[this.model.idKey])),
      null
    );
    return { previous };
  }

  private defaultRemoveOnSuccess() {
    this.client?.invalidateQueries({
      queryKey: this.modelKeys.search(),
    });
  }

  private defaultRemoveOnError(
    err: APIError,
    _item: Static<TModel["schemas"]["model"]>,
    context?: TContext<Static<TModel["schemas"]["model"]>>
  ) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    if (typeof context?.previous !== "undefined") {
      this.sync(context.previous);
    }
    this.client.invalidateQueries({
      queryKey: this.modelKeys.search(),
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
      onMutate: this.defaultRemoveOnMutate.bind(this),
      onSuccess: this.defaultRemoveOnSuccess.bind(this),
      onError: this.defaultRemoveOnError.bind(this),
    });
  }

  bind({ client, baseUrl, token }: ModelBindOptions) {
    this.client = client;
    this.baseUrl = baseUrl;
    this.token = token;
    this.bindCreateMutation();
    this.bindUpdateMutation();
    this.bindRemoveMutation();
    if (this._unstable_offlineModel) {
      this.initializeCache();
    }
    return this;
  }

  get(
    { id = "", fields = [], path = {} }: AxiomGetOptions<TSortable> = {
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
    const queryKey = [...this.modelKeys.get(id), JSON.stringify(path)];

    const select = useCallback(
      (data: Static<TModel["schemas"]["model"]>) => this.transform(data),
      [this.transform]
    );
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const query = useQuery({
      queryKey,
      enabled: options?.enabled !== false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnMount: true,
      retryOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: this.staleTime,
      gcTime: this.gcTime,
      initialData: this._unstable_offlineModel
        ? () => {
            return this.peek(id);
          }
        : undefined,
      ...options,
      queryFn: () =>
        createGetRequestFn<TModel["schemas"]["model"]>({
          resourcePath: buildResourcePath(
            this.baseUrl,
            this.model.resource,
            path
          ),
          token: this.token,
        })(id, encodeSearchQuery(fields)),
      select,
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ret = useMemo(
      () => ({
        ...query,
        isUpdating: query.isLoading || query.isFetching,
        data: query.data ?? undefined,
      }),
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
    }: AxiomQueryOptions<TSortable> = {},
    options?: Partial<
      UseQueryOptions<
        SearchQueryResult<Static<TModel["schemas"]["model"]>>,
        APIError,
        SearchQueryResult<ReturnType<TTransform>>
      >
    >
  ) {
    const commonArgs = {
      orderBy,
      fields,
      path,
    };

    const queryKey = this.modelKeys.searchBy({
      limit,
      offset,
      ...commonArgs,
    });

    const select = useCallback(
      (data: SearchQueryResult<Static<TModel["schemas"]["model"]>>) => {
        return Object.assign(data, {
          results: data.results.map((d) => this.transform(d)),
        });
      },
      [this.transform]
    );

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const query = useQuery({
      queryKey,
      queryFn: async () => {
        const searchQuery = encodeSearchQuery(fields);
        const cursor = this.getCursor(commonArgs, offset || 0);

        const { results, total, next, prev } = await createSearchRequestFn<
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
          orderBy:
            typeof orderBy === "string" ? orderBy : JSON.stringify(orderBy),
          next: cursor.next,
          // prev: cursor.prev, // ignoring prev for now since the BE is not dealing with it correctly
          knownCursors:
            cursor.knownCursors && JSON.stringify(cursor.knownCursors),
          ...searchQuery,
        });

        if (options?.enabled !== false) {
          this.cacheCursor(commonArgs, offset || 0, limit, next, prev);
        }

        this.sync(results);

        return {
          results,
          total,
          offset,
          limit,
          next,
          prev,
        };
      },
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnMount: true,
      retryOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: this.staleTime,
      gcTime: this.gcTime,
      initialData: this._unstable_offlineModel
        ? () => {
            return this.getInitialSearchData({
              limit,
              offset,
              orderBy,
              fields,
            });
          }
        : undefined,
      ...options,
      select,
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const emptyResults = useMemo(() => [], []);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ret = useMemo(() => {
      return {
        ...query,
        data: query.data?.results ?? emptyResults,
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
      Static<TModel["schemas"]["create"]>,
      TContext<Static<TModel["schemas"]["model"]>>
    >({
      mutationKey: this.modelKeys.create(),
      ...options,
      onSuccess: (data, variables, context) => {
        this.defaultCreateOnSuccess();
        options.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        this.defaultCreateOnError(error, variables, context);
        options.onError?.(error, variables, context);
      },
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
      Static<TModel["schemas"]["update"]>,
      TContext<Static<TModel["schemas"]["model"]>>
    >({
      mutationKey: this.modelKeys.update(),
      ...options,
      onSuccess: (data, variables, context) => {
        this.defaultUpdateOnSuccess();
        options.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        this.defaultUpdateOnError(error, variables, context);
        options.onError?.(error, variables, context);
      },
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
      Static<TModel["schemas"]["model"]>,
      TContext<Static<TModel["schemas"]["model"]>>
    >({
      mutationKey: this.modelKeys.remove(),
      ...options,
      onSuccess: (data, variables, context) => {
        this.defaultRemoveOnSuccess();
        options.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        this.defaultRemoveOnError(error, variables, context);
        options.onError?.(error, variables, context);
      },
    });
  }

  invalidate() {
    this.client?.invalidateQueries({ queryKey: this.modelKeys.search() });
  }

  invalidateById(id: string) {
    this.client?.invalidateQueries({ queryKey: this.modelKeys.get(id) });
  }

  read(): Static<TModel["schemas"]["model"]>[] | undefined {
    return this.client?.getQueryData(this.modelKeys.search());
  }

  readOne(id: string): Static<TModel["schemas"]["model"]> | undefined {
    return this.client?.getQueryData(this.modelKeys.get(id));
  }

  peek(id: string): Static<TModel["schemas"]["model"]> | undefined {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    const { results = [] } =
      this.client.getQueryData<
        SearchQueryResult<Static<TModel["schemas"]["model"]>>
      >(this.modelKeys.search()) ?? {};

    return results.find((item) => item[this.model.idKey] === id);
  }

  warm(options: {
    queryOptions?: AxiomQueryOptions<TSortable>;
    refetchInterval?: number;
  }) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }

    const { queryOptions = {}, refetchInterval = 30000 } = options;
    const {
      limit = 99,
      offset,
      orderBy,
      fields = [],
      comparator = "or",
      path,
    } = queryOptions;

    const commonArgs = {
      orderBy,
      fields,
      path,
    };

    const queryKey = this.modelKeys.searchBy({
      limit,
      offset,
      ...commonArgs,
    });

    return useQuery({
      queryKey,
      queryFn: async () => {
        const searchQuery = encodeSearchQuery(fields);
        const cursor = this.getCursor(commonArgs, offset || 0);

        const { results, total, next, prev } = await createSearchRequestFn<
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
          orderBy:
            typeof orderBy === "string" ? orderBy : JSON.stringify(orderBy),
          next: cursor.next,
          knownCursors:
            cursor.knownCursors && JSON.stringify(cursor.knownCursors),
          ...searchQuery,
        });

        this.cacheCursor(commonArgs, offset || 0, limit, next, prev);
        this.sync(results);

        return {
          results,
          total,
          offset,
          limit,
          next,
          prev,
        };
      },
      staleTime: this.staleTime,
      gcTime: Infinity,

      refetchInterval,
    });
  }

  async prefetch(params: {
    queryOptions?: AxiomQueryOptions<TSortable>;
    queryConfig?: Partial<UseQueryOptions>;
  }) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }

    const { queryOptions = {}, queryConfig = {} } = params;
    const { limit = 99, offset, orderBy, fields = [], path } = queryOptions;

    const commonArgs = {
      orderBy,
      fields,
      path,
    };

    const queryKey = this.modelKeys.searchBy({
      limit,
      offset,
      ...commonArgs,
    });

    return this.client.prefetchQuery({
      ...queryConfig,
      queryKey,
      queryFn: async () => {
        const searchQuery = encodeSearchQuery(queryOptions.fields || []);
        const cursor = this.getCursor({}, 0);

        const { results, total, next, prev } = await createSearchRequestFn<
          TModel["schemas"]["model"]
        >({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
          token: this.token,
          headers: {
            "X-Pagination-Fieldoperator": queryOptions.comparator ?? "or",
          },
        })({
          limit: queryOptions.limit ?? 99,
          offset: queryOptions.offset,
          orderBy:
            typeof queryOptions.orderBy === "string"
              ? queryOptions.orderBy
              : JSON.stringify(queryOptions.orderBy),
          next: cursor.next,
          knownCursors:
            cursor.knownCursors && JSON.stringify(cursor.knownCursors),
          ...searchQuery,
        });

        if (this._unstable_offlineModel) {
          this.sync(results);
        }

        return {
          results: results.map((d) => this.transform(d)),
          total,
          offset: queryOptions.offset ?? 0,
          limit: queryOptions.limit ?? 99,
          next,
          prev,
        };
      },
    });
  }

  updateCacheById(id: string, model: Static<TModel["schemas"]["model"]>) {
    this.client?.setQueryData(this.modelKeys.get(id), model);
  }

  private prepareSearchParams(
    params: Omit<SearchParams, "cursor">,
    pageParam: unknown
  ): Record<string, string | number | boolean | undefined> {
    const { sort, ...rest } = params;

    const searchParams = {
      ...rest,
      cursor: typeof pageParam === "string" ? pageParam : undefined,
      limit: params?.limit ?? this.model.infiniteSearch?.defaultLimit ?? 50,
    };

    // Handle sort serialization if present
    if (sort) {
      return {
        ...searchParams,
        sort: JSON.stringify(sort),
      };
    }

    return searchParams;
  }

  useInfiniteSearch(
    params?: Omit<SearchParams, "cursor">,
    options?: Partial<
      UseInfiniteQueryOptions<SearchResponse<ReturnType<TTransform>>, APIError>
    >
  ) {
    if (!this.model.infiniteSearch?.enabled) {
      throw new Error("Infinite search is not enabled for this model");
    }

    const queryKey = this.modelKeys.searchBy(
      params ?? { limit: this.model.infiniteSearch?.defaultLimit ?? 50 },
      "infinite"
    );

    return useInfiniteQuery({
      queryKey,
      initialPageParam: null as string | null,
      queryFn: async ({ pageParam }) => {
        const searchParams = this.prepareSearchParams(
          params ?? { limit: this.model.infiniteSearch?.defaultLimit ?? 50 },
          pageParam
        );

        const response = await createSearchRequestFn({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
          token: this.token,
        })(searchParams);

        return {
          results: response.results.map((result) => this.transform(result)),
          nextCursor: response.next,
          total: response.total,
          metadata: {
            currentResults: response.results.length,
            historicalResults: 0,
            timePeriodCovered: [
              new Date().toISOString(),
              new Date().toISOString(),
            ] as [string, string],
          },
        } satisfies SearchResponse<ReturnType<TTransform>>;
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
      ...options,
    });
  }
}

export type PaginationParams = {
  offset?: number;
  limit?: number;
  orderBy?: string;
  next?: string;
  prev?: string;
  knownCursors?: string;
};
