import * as _tanstack_react_query from '@tanstack/react-query';
import { QueryClient, UseQueryOptions, UseInfiniteQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { MutableRefObject, PropsWithChildren } from 'react';
import { TSchema, Static } from '@sinclair/typebox';
import { a as Model, t as SearchQuery, A as APIError, u as SearchQueryResult, q as SearchParams, m as SearchResponse, O as OrderBy, b as Procedure, x as Resource } from './resource-k3CMjb5R.cjs';
import * as react_jsx_runtime from 'react/jsx-runtime';
import 'ts-custom-error';

type AnyQueryResult = ReturnType<ReactModel<any, any, any, any, any, any>["query" | "get"]>;
type AnyMutationResult = ReturnType<ReactModel<any, any, any, any, any, any>["update" | "create" | "remove"]>;
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
type AxiomModelMutationOptions<TModal extends TSchema, TArgs extends TSchema> = UseMutationOptions<Static<TModal>, unknown, Static<TArgs>, TContext<Static<TModal>>>;
type TContext<TData = undefined> = {
    previous?: TData;
};
interface ModelBindOptions {
    client: QueryClient;
    baseUrl: string;
    token: MutableRefObject<string | null>;
}
interface ReactModelOptions<TModel extends Model<TM, TC, TU, any, any, any, TTransform, TSortable>, TM extends TSchema, TC extends TSchema, TU extends TSchema, TTransform extends (serialized: Static<TModel["schemas"]["model"]>) => any, TSortable extends TSchema = TM> {
    model: TModel;
    baseUrl: string;
    _unstable_offlineModel?: boolean;
}
declare class ReactModel<TModel extends Model<TM, TC, TU, any, any, any, TTransform, TSortable>, TM extends TSchema, TC extends TSchema, TU extends TSchema, TTransform extends (serialized: Static<TModel["schemas"]["model"]>) => any, TSortable extends TSchema = TM> {
    model: TModel;
    client?: QueryClient;
    baseUrl: string;
    token: MutableRefObject<string | null>;
    _unstable_offlineModel?: boolean;
    constructor(options: ReactModelOptions<TModel, TM, TC, TU, TTransform, TSortable>);
    modelKeys: {
        get: (id: string) => string[];
        search: () => string[];
        searchBy: (args: SearchQuery<TSortable> & {
            path?: Record<string, unknown>;
        }, append?: string) => (string | (SearchQuery<TSortable> & {
            path?: Record<string, unknown>;
        }))[];
        create: () => string[];
        update: () => string[];
        remove: () => string[];
    };
    transform(serialized: Static<TModel["schemas"]["model"]>): ReturnType<TTransform>;
    private initializeCache;
    private sync;
    private destroy;
    private getInitialSearchData;
    private preparePayloadForSubmission;
    private defaultCreateOnMutate;
    private defaultCreateOnSuccess;
    private defaultCreateOnError;
    private bindCreateMutation;
    private cacheCursor;
    private getCursor;
    private defaultUpdateOnMutate;
    private defaultUpdateOnSuccess;
    private defaultUpdateOnError;
    bindUpdateMutation(): void;
    private defaultRemoveOnMutate;
    private defaultRemoveOnSuccess;
    private defaultRemoveOnError;
    bindRemoveMutation(): void;
    bind({ client, baseUrl, token }: ModelBindOptions): this;
    get({ id, fields, path }?: AxiomGetOptions<TSortable>, options?: Partial<UseQueryOptions<Static<TModel["schemas"]["model"]>, APIError, ReturnType<TTransform>>>): {
        isUpdating: boolean;
        data: NonNullable<ReturnType<TTransform>> | undefined;
        error: APIError;
        isError: true;
        isPending: false;
        isLoading: false;
        isLoadingError: false;
        isRefetchError: true;
        isSuccess: false;
        status: "error";
        dataUpdatedAt: number;
        errorUpdatedAt: number;
        failureCount: number;
        failureReason: APIError | null;
        errorUpdateCount: number;
        isFetched: boolean;
        isFetchedAfterMount: boolean;
        isFetching: boolean;
        isInitialLoading: boolean;
        isPaused: boolean;
        isPlaceholderData: boolean;
        isRefetching: boolean;
        isStale: boolean;
        refetch: (options?: _tanstack_react_query.RefetchOptions) => Promise<_tanstack_react_query.QueryObserverResult<ReturnType<TTransform>, APIError>>;
        fetchStatus: _tanstack_react_query.FetchStatus;
    } | {
        isUpdating: boolean;
        data: NonNullable<ReturnType<TTransform>> | undefined;
        error: null;
        isError: false;
        isPending: false;
        isLoading: false;
        isLoadingError: false;
        isRefetchError: false;
        isSuccess: true;
        status: "success";
        dataUpdatedAt: number;
        errorUpdatedAt: number;
        failureCount: number;
        failureReason: APIError | null;
        errorUpdateCount: number;
        isFetched: boolean;
        isFetchedAfterMount: boolean;
        isFetching: boolean;
        isInitialLoading: boolean;
        isPaused: boolean;
        isPlaceholderData: boolean;
        isRefetching: boolean;
        isStale: boolean;
        refetch: (options?: _tanstack_react_query.RefetchOptions) => Promise<_tanstack_react_query.QueryObserverResult<ReturnType<TTransform>, APIError>>;
        fetchStatus: _tanstack_react_query.FetchStatus;
    } | {
        isUpdating: boolean;
        data: NonNullable<ReturnType<TTransform>> | undefined;
        error: APIError;
        isError: true;
        isPending: false;
        isLoading: false;
        isLoadingError: true;
        isRefetchError: false;
        isSuccess: false;
        status: "error";
        dataUpdatedAt: number;
        errorUpdatedAt: number;
        failureCount: number;
        failureReason: APIError | null;
        errorUpdateCount: number;
        isFetched: boolean;
        isFetchedAfterMount: boolean;
        isFetching: boolean;
        isInitialLoading: boolean;
        isPaused: boolean;
        isPlaceholderData: boolean;
        isRefetching: boolean;
        isStale: boolean;
        refetch: (options?: _tanstack_react_query.RefetchOptions) => Promise<_tanstack_react_query.QueryObserverResult<ReturnType<TTransform>, APIError>>;
        fetchStatus: _tanstack_react_query.FetchStatus;
    } | {
        isUpdating: boolean;
        data: NonNullable<ReturnType<TTransform>> | undefined;
        error: null;
        isError: false;
        isPending: true;
        isLoading: true;
        isLoadingError: false;
        isRefetchError: false;
        isSuccess: false;
        status: "pending";
        dataUpdatedAt: number;
        errorUpdatedAt: number;
        failureCount: number;
        failureReason: APIError | null;
        errorUpdateCount: number;
        isFetched: boolean;
        isFetchedAfterMount: boolean;
        isFetching: boolean;
        isInitialLoading: boolean;
        isPaused: boolean;
        isPlaceholderData: boolean;
        isRefetching: boolean;
        isStale: boolean;
        refetch: (options?: _tanstack_react_query.RefetchOptions) => Promise<_tanstack_react_query.QueryObserverResult<ReturnType<TTransform>, APIError>>;
        fetchStatus: _tanstack_react_query.FetchStatus;
    } | {
        isUpdating: boolean;
        data: NonNullable<ReturnType<TTransform>> | undefined;
        error: null;
        isError: false;
        isPending: true;
        isLoadingError: false;
        isRefetchError: false;
        isSuccess: false;
        status: "pending";
        dataUpdatedAt: number;
        errorUpdatedAt: number;
        failureCount: number;
        failureReason: APIError | null;
        errorUpdateCount: number;
        isFetched: boolean;
        isFetchedAfterMount: boolean;
        isFetching: boolean;
        isLoading: boolean;
        isInitialLoading: boolean;
        isPaused: boolean;
        isPlaceholderData: boolean;
        isRefetching: boolean;
        isStale: boolean;
        refetch: (options?: _tanstack_react_query.RefetchOptions) => Promise<_tanstack_react_query.QueryObserverResult<ReturnType<TTransform>, APIError>>;
        fetchStatus: _tanstack_react_query.FetchStatus;
    };
    query({ offset, limit, orderBy, fields, comparator, path, }?: AxiomQueryOptions<TSortable>, options?: Partial<UseQueryOptions<SearchQueryResult<Static<TModel["schemas"]["model"]>>, APIError, SearchQueryResult<ReturnType<TTransform>>>>): {
        data: Static<TModel["schemas"]["model"]>[] & ReturnType<TTransform>[];
        total: number;
        offset: number;
        limit: number;
        isUpdating: boolean;
        error: APIError;
        isError: true;
        isPending: false;
        isLoading: false;
        isLoadingError: false;
        isRefetchError: true;
        isSuccess: false;
        status: "error";
        dataUpdatedAt: number;
        errorUpdatedAt: number;
        failureCount: number;
        failureReason: APIError | null;
        errorUpdateCount: number;
        isFetched: boolean;
        isFetchedAfterMount: boolean;
        isFetching: boolean;
        isInitialLoading: boolean;
        isPaused: boolean;
        isPlaceholderData: boolean;
        isRefetching: boolean;
        isStale: boolean;
        refetch: (options?: _tanstack_react_query.RefetchOptions) => Promise<_tanstack_react_query.QueryObserverResult<SearchQueryResult<Static<TModel["schemas"]["model"]>> & {
            results: ReturnType<TTransform>[];
        }, APIError>>;
        fetchStatus: _tanstack_react_query.FetchStatus;
    } | {
        data: Static<TModel["schemas"]["model"]>[] & ReturnType<TTransform>[];
        total: number;
        offset: number;
        limit: number;
        isUpdating: boolean;
        error: null;
        isError: false;
        isPending: false;
        isLoading: false;
        isLoadingError: false;
        isRefetchError: false;
        isSuccess: true;
        status: "success";
        dataUpdatedAt: number;
        errorUpdatedAt: number;
        failureCount: number;
        failureReason: APIError | null;
        errorUpdateCount: number;
        isFetched: boolean;
        isFetchedAfterMount: boolean;
        isFetching: boolean;
        isInitialLoading: boolean;
        isPaused: boolean;
        isPlaceholderData: boolean;
        isRefetching: boolean;
        isStale: boolean;
        refetch: (options?: _tanstack_react_query.RefetchOptions) => Promise<_tanstack_react_query.QueryObserverResult<SearchQueryResult<Static<TModel["schemas"]["model"]>> & {
            results: ReturnType<TTransform>[];
        }, APIError>>;
        fetchStatus: _tanstack_react_query.FetchStatus;
    } | {
        data: Static<TModel["schemas"]["model"]>[] & ReturnType<TTransform>[];
        total: number;
        offset: number;
        limit: number;
        isUpdating: boolean;
        error: APIError;
        isError: true;
        isPending: false;
        isLoading: false;
        isLoadingError: true;
        isRefetchError: false;
        isSuccess: false;
        status: "error";
        dataUpdatedAt: number;
        errorUpdatedAt: number;
        failureCount: number;
        failureReason: APIError | null;
        errorUpdateCount: number;
        isFetched: boolean;
        isFetchedAfterMount: boolean;
        isFetching: boolean;
        isInitialLoading: boolean;
        isPaused: boolean;
        isPlaceholderData: boolean;
        isRefetching: boolean;
        isStale: boolean;
        refetch: (options?: _tanstack_react_query.RefetchOptions) => Promise<_tanstack_react_query.QueryObserverResult<SearchQueryResult<Static<TModel["schemas"]["model"]>> & {
            results: ReturnType<TTransform>[];
        }, APIError>>;
        fetchStatus: _tanstack_react_query.FetchStatus;
    } | {
        data: Static<TModel["schemas"]["model"]>[] & ReturnType<TTransform>[];
        total: number;
        offset: number;
        limit: number;
        isUpdating: boolean;
        error: null;
        isError: false;
        isPending: true;
        isLoading: true;
        isLoadingError: false;
        isRefetchError: false;
        isSuccess: false;
        status: "pending";
        dataUpdatedAt: number;
        errorUpdatedAt: number;
        failureCount: number;
        failureReason: APIError | null;
        errorUpdateCount: number;
        isFetched: boolean;
        isFetchedAfterMount: boolean;
        isFetching: boolean;
        isInitialLoading: boolean;
        isPaused: boolean;
        isPlaceholderData: boolean;
        isRefetching: boolean;
        isStale: boolean;
        refetch: (options?: _tanstack_react_query.RefetchOptions) => Promise<_tanstack_react_query.QueryObserverResult<SearchQueryResult<Static<TModel["schemas"]["model"]>> & {
            results: ReturnType<TTransform>[];
        }, APIError>>;
        fetchStatus: _tanstack_react_query.FetchStatus;
    } | {
        data: Static<TModel["schemas"]["model"]>[] & ReturnType<TTransform>[];
        total: number;
        offset: number;
        limit: number;
        isUpdating: boolean;
        error: null;
        isError: false;
        isPending: true;
        isLoadingError: false;
        isRefetchError: false;
        isSuccess: false;
        status: "pending";
        dataUpdatedAt: number;
        errorUpdatedAt: number;
        failureCount: number;
        failureReason: APIError | null;
        errorUpdateCount: number;
        isFetched: boolean;
        isFetchedAfterMount: boolean;
        isFetching: boolean;
        isLoading: boolean;
        isInitialLoading: boolean;
        isPaused: boolean;
        isPlaceholderData: boolean;
        isRefetching: boolean;
        isStale: boolean;
        refetch: (options?: _tanstack_react_query.RefetchOptions) => Promise<_tanstack_react_query.QueryObserverResult<SearchQueryResult<Static<TModel["schemas"]["model"]>> & {
            results: ReturnType<TTransform>[];
        }, APIError>>;
        fetchStatus: _tanstack_react_query.FetchStatus;
    };
    create(options?: AxiomModelMutationOptions<TModel["schemas"]["model"], TModel["schemas"]["create"]>): _tanstack_react_query.UseMutationResult<Static<TModel["schemas"]["model"]>, APIError, Static<TModel["schemas"]["create"]>, TContext<Static<TModel["schemas"]["model"]>>>;
    update(options?: AxiomModelMutationOptions<TModel["schemas"]["model"], TModel["schemas"]["update"]>): _tanstack_react_query.UseMutationResult<Static<TModel["schemas"]["model"]>, APIError, Static<TModel["schemas"]["update"]>, TContext<Static<TModel["schemas"]["model"]>>>;
    remove(options?: AxiomModelMutationOptions<TModel["schemas"]["model"], TModel["schemas"]["model"]>): _tanstack_react_query.UseMutationResult<Static<TModel["schemas"]["model"]>, APIError, Static<TModel["schemas"]["model"]>, TContext<Static<TModel["schemas"]["model"]>>>;
    invalidate(): void;
    invalidateById(id: string): void;
    read(): Static<TModel["schemas"]["model"]>[] | undefined;
    readOne(id: string): Static<TModel["schemas"]["model"]> | undefined;
    peek(id: string): Static<TModel["schemas"]["model"]> | undefined;
    warm(options: {
        queryOptions?: AxiomQueryOptions<TSortable>;
        refetchInterval?: number;
    }): _tanstack_react_query.UseQueryResult<undefined, Error>;
    prefetch(params: {
        queryOptions?: AxiomQueryOptions<TSortable>;
        queryConfig?: Partial<UseQueryOptions>;
    }): Promise<void>;
    updateCacheById(id: string, model: Static<TModel["schemas"]["model"]>): void;
    private prepareSearchParams;
    useInfiniteSearch(params?: Omit<SearchParams, "cursor">, options?: Partial<UseInfiniteQueryOptions<SearchResponse<ReturnType<TTransform>>, APIError>>): _tanstack_react_query.UseInfiniteQueryResult<SearchResponse<ReturnType<TTransform>>, APIError>;
}
type PaginationParams = {
    offset?: number;
    limit?: number;
    orderBy?: string;
    next?: string;
    prev?: string;
    knownCursors?: string;
};

interface ReactProcedureOptions<TParams extends TSchema, TQuery extends TSchema, TResult extends TSchema> {
    procedure: Procedure<TParams, TQuery, TResult>;
}
interface ProcedureBindOptions {
    client: QueryClient;
    baseUrl: string;
    token: MutableRefObject<string | null>;
}
declare class ReactProcedure<TProcedure extends Procedure<any, any, any>> {
    baseUrl: string;
    token: MutableRefObject<string | null>;
    client?: QueryClient;
    procedure: Procedure<TProcedure["params"], TProcedure["query"], TProcedure["result"]>;
    constructor(options: ReactProcedureOptions<TProcedure["params"], TProcedure["query"], TProcedure["result"]>);
    bind({ client, baseUrl, token }: ProcedureBindOptions): this;
    run(options?: UseMutationOptions<Static<TProcedure["result"]>, Error, Static<TProcedure["params"]>>): {
        mutate: _tanstack_react_query.UseMutateFunction<Static<TProcedure["result"]>, Error, Static<TProcedure["params"]> & Static<TProcedure["query"]>, unknown>;
        run: _tanstack_react_query.UseMutateAsyncFunction<Static<TProcedure["result"]>, Error, Static<TProcedure["params"]> & Static<TProcedure["query"]>, unknown>;
        data: undefined;
        variables: undefined;
        error: null;
        isError: false;
        isIdle: true;
        isPending: false;
        isSuccess: false;
        status: "idle";
        reset: () => void;
        context: unknown;
        failureCount: number;
        failureReason: Error | null;
        isPaused: boolean;
        submittedAt: number;
        mutateAsync: _tanstack_react_query.UseMutateAsyncFunction<Static<TProcedure["result"]>, Error, Static<TProcedure["params"]> & Static<TProcedure["query"]>, unknown>;
    } | {
        mutate: _tanstack_react_query.UseMutateFunction<Static<TProcedure["result"]>, Error, Static<TProcedure["params"]> & Static<TProcedure["query"]>, unknown>;
        run: _tanstack_react_query.UseMutateAsyncFunction<Static<TProcedure["result"]>, Error, Static<TProcedure["params"]> & Static<TProcedure["query"]>, unknown>;
        data: undefined;
        variables: Static<TProcedure["params"]> & Static<TProcedure["query"]>;
        error: null;
        isError: false;
        isIdle: false;
        isPending: true;
        isSuccess: false;
        status: "pending";
        reset: () => void;
        context: unknown;
        failureCount: number;
        failureReason: Error | null;
        isPaused: boolean;
        submittedAt: number;
        mutateAsync: _tanstack_react_query.UseMutateAsyncFunction<Static<TProcedure["result"]>, Error, Static<TProcedure["params"]> & Static<TProcedure["query"]>, unknown>;
    } | {
        mutate: _tanstack_react_query.UseMutateFunction<Static<TProcedure["result"]>, Error, Static<TProcedure["params"]> & Static<TProcedure["query"]>, unknown>;
        run: _tanstack_react_query.UseMutateAsyncFunction<Static<TProcedure["result"]>, Error, Static<TProcedure["params"]> & Static<TProcedure["query"]>, unknown>;
        data: undefined;
        error: Error;
        variables: Static<TProcedure["params"]> & Static<TProcedure["query"]>;
        isError: true;
        isIdle: false;
        isPending: false;
        isSuccess: false;
        status: "error";
        reset: () => void;
        context: unknown;
        failureCount: number;
        failureReason: Error | null;
        isPaused: boolean;
        submittedAt: number;
        mutateAsync: _tanstack_react_query.UseMutateAsyncFunction<Static<TProcedure["result"]>, Error, Static<TProcedure["params"]> & Static<TProcedure["query"]>, unknown>;
    } | {
        mutate: _tanstack_react_query.UseMutateFunction<Static<TProcedure["result"]>, Error, Static<TProcedure["params"]> & Static<TProcedure["query"]>, unknown>;
        run: _tanstack_react_query.UseMutateAsyncFunction<Static<TProcedure["result"]>, Error, Static<TProcedure["params"]> & Static<TProcedure["query"]>, unknown>;
        data: Static<TProcedure["result"]>;
        error: null;
        variables: Static<TProcedure["params"]> & Static<TProcedure["query"]>;
        isError: false;
        isIdle: false;
        isPending: false;
        isSuccess: true;
        status: "success";
        reset: () => void;
        context: unknown;
        failureCount: number;
        failureReason: Error | null;
        isPaused: boolean;
        submittedAt: number;
        mutateAsync: _tanstack_react_query.UseMutateAsyncFunction<Static<TProcedure["result"]>, Error, Static<TProcedure["params"]> & Static<TProcedure["query"]>, unknown>;
    };
}

interface ReactResourceOptions<TResp extends TSchema, TParams extends TSchema> {
    resource: Resource<TResp, TParams>;
}
interface ReactResourceBindOptions {
    baseUrl: string;
    client: QueryClient;
    token: MutableRefObject<string | null>;
}
interface ResourceGetOptions<TResp extends TSchema, TParams extends TSchema, TTransformed = Static<TResp>> {
    params?: Static<TParams>;
    select?: (data: Static<TResp>) => TTransformed;
}
declare class ReactResource<TResource extends Resource<any, any>> {
    resource: Resource<TResource["schema"], TResource["params"]>;
    baseUrl?: string;
    token?: MutableRefObject<string | null>;
    client?: QueryClient;
    constructor(options: ReactResourceOptions<TResource["schema"], TResource["params"]>);
    bind({ client, baseUrl, token }: ReactResourceBindOptions): this;
    get(params: Static<TResource["params"]>, options?: ResourceGetOptions<TResource["schema"], TResource["params"]>): _tanstack_react_query.UseQueryResult<Static<TResource["schema"]>, Error>;
}

type ModelMap<M extends Record<string, Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>>> = {
    [K in keyof M]: M[K];
};
type ReactModelMap<M extends Record<string, Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any, TSchema>>> = {
    [K in keyof M]: ReactModel<M[K], M[K]["schemas"]["model"], M[K]["schemas"]["create"], M[K]["schemas"]["update"], M[K]["transformer"], M[K]["sortableBy"]>;
};
type ProcedureMap<P extends Record<string, Procedure<TSchema, TSchema, TSchema>>> = {
    [K in keyof P]: P[K];
};
type ReactProcedureMap<P extends Record<string, Procedure<TSchema, TSchema, TSchema>>> = {
    [K in keyof P]: ReactProcedure<P[K]>;
};
type ResourceMap<P extends Record<string, Resource<TSchema, TSchema>>> = {
    [K in keyof P]: P[K];
};
type ReactResourceMap<R extends Record<string, Resource<TSchema, TSchema>>> = {
    [K in keyof R]: ReactResource<R[K]>;
};
interface CreateApiOptions<M extends Record<string, Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>>, P extends Record<string, Procedure<TSchema, TSchema, TSchema>>, R extends Record<string, Resource<TSchema, TSchema>>> {
    client: QueryClient;
    baseUrl: string;
    models: M;
    fns: P;
    resources: R;
    token: MutableRefObject<string | null>;
}
declare function createApi<M extends Record<string, Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any, TSchema>>, P extends Record<string, Procedure<TSchema, TSchema, TSchema>>, R extends Record<string, Resource<TSchema, TSchema>>>({ models, fns, resources, client, baseUrl, token, }: CreateApiOptions<M, P, R>): ReactModelMap<M> & ReactProcedureMap<P> & ReactResourceMap<R>;

type ApiProviderProps<M extends Record<string, Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>>, P extends Record<string, Procedure<TSchema, TSchema, TSchema>>, R extends Record<string, Resource<TSchema, TSchema>>> = {
    models?: M;
    fns?: P;
    resources?: R;
    baseUrl: string;
    client?: QueryClient;
    token?: string;
};
declare function createApiProvider<M extends Record<string, Model<any, any, any, any, any, any, any>>, P extends Record<string, Procedure<any, any, any>>, R extends Record<string, Resource<any, any>>>({ models, fns, resources, }: {
    models?: M;
    fns?: P;
    resources?: R;
}): (props: PropsWithChildren<ApiProviderProps<M, P, R>>) => react_jsx_runtime.JSX.Element;
declare function createUseApiHook<M extends Record<string, Model<any, any, any, any, any, any, any>>, P extends Record<string, Procedure<any, any, any>>, R extends Record<string, Resource<any, any>>>({}: {
    models?: M;
    fns?: P;
    resources?: R;
}): () => ReactModelMap<M> & ReactProcedureMap<P> & ReactResourceMap<R>;

type QueryParameters = Record<string, string | number | boolean | undefined>;
interface APIRequestParams<T> {
    method?: string;
    headers?: Record<string, string>;
    query?: QueryParameters;
    body?: T;
    token?: string | null;
}
declare function paramsForQuery<TParams extends Record<string, string | number>>(url: string, params?: TParams): {
    [k: string]: string | number;
};
declare function buildResourcePath<TParams extends Record<string, string | number>>(baseUrl: string, resource: string, params?: TParams): string;
declare function request<TRequestBody, TResponseBody = TRequestBody>(url: string, { method, headers, query, body, token, }?: APIRequestParams<TRequestBody>): Promise<[TResponseBody, PaginationParams & {
    total: number;
}]>;
type RequestCreatorOptions = {
    resourcePath: string;
    token: MutableRefObject<string | null>;
    headers?: Record<string, string>;
};
declare function createSearchRequestFn<T extends TSchema>({ resourcePath, token, headers, ...options }: RequestCreatorOptions): ({ offset, limit, orderBy, knownCursors, next: nextParam, prev: prevParam, ...query }?: PaginationParams & QueryParameters) => Promise<{
    results: Static<T>[];
    total: number;
    offset: number;
    limit: number;
    orderBy: string | undefined;
    next: string | undefined;
    prev: string | undefined;
}>;
declare function createCallRequestFn<T extends TSchema>({ resourcePath, token, ...options }: RequestCreatorOptions): (params: QueryParameters) => Promise<Static<T>>;
declare function createGetRequestFn<T extends TSchema>({ resourcePath, token, ...options }: RequestCreatorOptions): (id: string | number, query?: QueryParameters) => Promise<Static<T>>;
declare function createCreateRequestFn<T extends TSchema>({ resourcePath, token, ...options }: RequestCreatorOptions): (body: Static<T>) => Promise<Static<T>>;
declare function createUpdateRequestFn<T extends TSchema>({ resourcePath, token, ...options }: RequestCreatorOptions): (id: string | number, body: Static<T>) => Promise<Static<T>>;
declare function createRemoveRequestFn<T extends TSchema>({ resourcePath, token, ...options }: RequestCreatorOptions): (id: string | number, body: Static<T>) => Promise<Static<T>>;

export { type AnyMutationResult, type AnyQueryResult, type ModelMap, type PaginationParams, type ProcedureMap, type QueryParameters, ReactModel, type ReactModelMap, type ReactModelOptions, ReactProcedure, type ReactProcedureMap, type ReactProcedureOptions, ReactResource, type ReactResourceMap, type ResourceMap, buildResourcePath, createApi, createApiProvider, createCallRequestFn, createCreateRequestFn, createGetRequestFn, createRemoveRequestFn, createSearchRequestFn, createUpdateRequestFn, createUseApiHook, paramsForQuery, request };
