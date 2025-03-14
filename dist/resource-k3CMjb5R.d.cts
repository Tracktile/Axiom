import { TSchema, Static, TObject, TNumber, TTuple, TString, TArray, TAny, TOptional, TUnion, TLiteral, TBoolean } from '@sinclair/typebox';
import { CustomError } from 'ts-custom-error';

type ModelOptions<TModel extends TSchema, TCreate extends TSchema, TUpdate extends TSchema, TDelete extends TSchema, TQuery extends TSchema, TPath extends TSchema, TTransform extends (serialized: Static<TModel>) => any, TSortable extends TSchema> = {
    name: string;
    resource: string;
    idKey: Exclude<keyof Static<TModel>, symbol>;
    model: TModel;
    create?: TCreate;
    update?: TUpdate;
    del?: TDelete;
    query?: TQuery;
    path?: TPath;
    transformer: TTransform;
    sortableBy?: TSortable;
    _unstable_offlineModel?: boolean;
    infiniteSearch?: {
        enabled: boolean;
        defaultLimit?: number;
    };
};
declare class Model<TModel extends TSchema, TCreate extends TSchema = TModel, TUpdate extends TSchema = TModel, TDelete extends TSchema = TObject, TQuery extends TSchema = TObject, TPath extends TSchema = TObject, TTransform extends (serialized: Static<TModel>) => any = (m: Static<TModel>) => typeof m, TSortable extends TSchema = TModel> {
    name: string;
    resource: string;
    idKey: Exclude<keyof Static<TModel>, symbol>;
    schemas: {
        model: TModel;
        create: TCreate;
        update: TUpdate;
        del: TDelete;
        query: TQuery;
        path: TPath;
    };
    transformer: TTransform;
    sortableBy: TSortable;
    _unstable_offlineModel?: boolean;
    infiniteSearch?: {
        enabled: boolean;
        defaultLimit: number;
    };
    constructor(options: ModelOptions<TModel, TCreate, TUpdate, TDelete, TQuery, TPath, TTransform, TSortable>);
    getSearchResponseType(): TSchema;
    getSearchParamsType(): TSchema;
}
declare function createModel<TModel extends TSchema, TCreate extends TSchema, TUpdate extends TSchema, TDelete extends TSchema, TQuery extends TSchema, TPath extends TSchema, TTransformer extends (serialized: Static<TModel>) => any, TSortable extends TSchema = TModel>(options: ModelOptions<TModel, TCreate, TUpdate, TDelete, TQuery, TPath, TTransformer, TSortable>): Model<TModel, TCreate, TUpdate, TDelete, TQuery, TPath, TTransformer, TSortable>;

interface ProcedureOptions<TParams extends TSchema, TQuery extends TSchema, TResult extends TSchema> {
    name: string;
    resource: string;
    params: TParams;
    result: TResult;
    query?: TQuery;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
}
declare class Procedure<TParams extends TSchema, TQuery extends TSchema, TResult extends TSchema> {
    name: string;
    resource: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    params: TParams;
    query: TQuery;
    result: TResult;
    constructor(options: ProcedureOptions<TParams, TQuery, TResult>);
}
declare function createProcedure<TParams extends TSchema, TQuery extends TSchema, TResult extends TSchema>(options: ProcedureOptions<TParams, TQuery, TResult>): Procedure<TParams, TQuery, TResult>;

declare enum ErrorType {
    BadRequest = "BadRequest",
    Unauthorized = "Unauthorized",
    Forbidden = "Forbidden",
    NotFound = "NotFound",
    InternalServerError = "InternalServerError"
}
declare class APIError extends CustomError {
    type: ErrorType;
    status: number;
    errors: Record<string, unknown>;
    constructor(status: number, message: string, errors?: Record<string, string>);
}
declare function isAPIError(error: unknown): error is APIError;
declare class BadRequestError extends APIError {
    fields: Record<string, string>;
    constructor(message?: string, fieldErrors?: Record<string, string>);
}
declare function isBadRequestError(error: APIError): error is BadRequestError;
declare class UnauthorizedError extends APIError {
    constructor(message?: string, errors?: Record<string, string>);
}
declare function isUnauthorizedError(error: APIError): error is UnauthorizedError;
declare class ForbiddenError extends APIError {
    constructor(message?: string, errors?: Record<string, string>);
}
declare function isForbiddenError(error: APIError): error is ForbiddenError;
declare class NotFoundError extends APIError {
    constructor(message?: string, errors?: Record<string, string>);
}
declare function isNotFoundError(error: APIError): error is NotFoundError;
declare class InternalServerError extends APIError {
    constructor(message?: string, errors?: Record<string, string>);
}
declare function isInternalServerError(error: APIError): error is InternalServerError;
declare const assert: (condition: any, message: string, error?: typeof BadRequestError) => void;

interface SearchMetadata {
    currentResults: number;
    historicalResults: number;
    timePeriodCovered: [string, string];
}
declare const SearchMetadataSchema: TObject<{
    currentResults: TNumber;
    historicalResults: TNumber;
    timePeriodCovered: TTuple<[TString, TString]>;
}>;
interface SearchResponse<T> {
    results: T[];
    nextCursor?: string;
    total: number;
    metadata: SearchMetadata;
}
declare const SearchResponseSchema: TObject<{
    results: TArray<TAny>;
    nextCursor: TOptional<TString>;
    total: TNumber;
    metadata: TObject<{
        currentResults: TNumber;
        historicalResults: TNumber;
        timePeriodCovered: TTuple<[TString, TString]>;
    }>;
}>;
interface SearchFilter {
    field: string;
    operator: "eq" | "contains" | "gt" | "lt" | "between";
    value: string | number | boolean | [string | number];
}
declare const SearchFilterSchema: TObject<{
    field: TString;
    operator: TUnion<[TLiteral<"eq">, TLiteral<"contains">, TLiteral<"gt">, TLiteral<"lt">, TLiteral<"between">]>;
    value: TUnion<[TString, TNumber, TBoolean, TArray<TUnion<[TString, TNumber]>>]>;
}>;
interface SearchParams {
    cursor?: string;
    limit: number;
    search?: string;
    sort?: {
        field: string;
        direction: "asc" | "desc";
    };
}
declare const SearchParamsSchema: TObject<{
    cursor: TOptional<TString>;
    limit: TNumber;
    search: TOptional<TString>;
    sort: TOptional<TObject<{
        field: TString;
        direction: TUnion<[TLiteral<"asc">, TLiteral<"desc">]>;
    }>>;
}>;
type SearchQueryField = {
    name: string;
    comparator?: "and" | "or";
    is?: string | number | boolean;
    contains?: string;
    isOneOf?: string[];
    isLikeOneOf?: string[];
    isGreaterThan?: string | number;
    isLessThan?: string | number;
    isBetween?: [string | number, string | number];
    isNull?: boolean;
};
type OrderBy<T> = {
    key: Exclude<keyof T, symbol>;
    order: "asc" | "desc";
};
type SearchQuery<TSortable = Record<string, unknown>> = {
    fields?: SearchQueryField[];
    offset?: number;
    limit?: number;
    orderBy?: string | OrderBy<TSortable>;
};
type SearchQueryResult<T> = {
    results: T[];
    total: number;
    offset?: number;
    limit: number;
};
declare const encodeSearchQuery: <TSortable>(fields: Required<SearchQuery<TSortable>>["fields"]) => Record<string, string>;
declare function decodeSearchQuery(query: Record<string, string>): SearchQueryField[];

interface ResourceOptions<TResp extends TSchema, TParams extends TSchema> {
    name: string;
    resource: string;
    schema: TResp;
    params: TParams;
}
declare class Resource<TResp extends TSchema, TParams extends TSchema> {
    name: string;
    resource: string;
    schema: TResp;
    params: TParams;
    constructor(options: ResourceOptions<TResp, TParams>);
}
declare function createResource<TResp extends TSchema, TParams extends TSchema>(options: ResourceOptions<TResp, TParams>): Resource<TResp, TParams>;

export { APIError as A, BadRequestError as B, ErrorType as E, ForbiddenError as F, InternalServerError as I, type ModelOptions as M, NotFoundError as N, type OrderBy as O, type ProcedureOptions as P, type ResourceOptions as R, type SearchMetadata as S, UnauthorizedError as U, Model as a, Procedure as b, createModel as c, createProcedure as d, isBadRequestError as e, isUnauthorizedError as f, isForbiddenError as g, isNotFoundError as h, isAPIError as i, isInternalServerError as j, assert as k, SearchMetadataSchema as l, type SearchResponse as m, SearchResponseSchema as n, type SearchFilter as o, SearchFilterSchema as p, type SearchParams as q, SearchParamsSchema as r, type SearchQueryField as s, type SearchQuery as t, type SearchQueryResult as u, encodeSearchQuery as v, decodeSearchQuery as w, Resource as x, createResource as y };
