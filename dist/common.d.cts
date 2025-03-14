import { TSchema, TUnsafe, Static, TObject } from '@sinclair/typebox';
export * from '@sinclair/typebox';
export { Type as T, TypeGuard } from '@sinclair/typebox';
export { Value } from '@sinclair/typebox/value';
export { TypeCompiler } from '@sinclair/typebox/compiler';
export { TypeSystem } from '@sinclair/typebox/system';
export { A as APIError, B as BadRequestError, E as ErrorType, F as ForbiddenError, I as InternalServerError, a as Model, M as ModelOptions, N as NotFoundError, O as OrderBy, b as Procedure, P as ProcedureOptions, x as Resource, R as ResourceOptions, o as SearchFilter, p as SearchFilterSchema, S as SearchMetadata, l as SearchMetadataSchema, q as SearchParams, r as SearchParamsSchema, t as SearchQuery, s as SearchQueryField, u as SearchQueryResult, m as SearchResponse, n as SearchResponseSchema, U as UnauthorizedError, k as assert, c as createModel, d as createProcedure, y as createResource, w as decodeSearchQuery, v as encodeSearchQuery, i as isAPIError, e as isBadRequestError, g as isForbiddenError, j as isInternalServerError, h as isNotFoundError, f as isUnauthorizedError } from './resource-k3CMjb5R.cjs';
import 'ts-custom-error';

type IsDotSeparated<T extends string> = T extends `${string}.${string}` ? true : false;
type GetLeft<T extends string> = T extends `${infer Left}.${string}` ? Left : undefined;
type FieldWithPossiblyUndefined<T, Key> = GetFieldType<Exclude<T, undefined>, Key> | Extract<T, undefined>;
type GetIndexedField<T, K> = K extends keyof T ? T[K] : K extends `${number}` ? "0" extends keyof T ? undefined : number extends keyof T ? T[number] : undefined : undefined;
type GetFieldType<T, P> = P extends `${infer Left}.${infer Right}` ? Left extends keyof T ? FieldWithPossiblyUndefined<T[Left], Right> : Left extends `${infer FieldKey}[${infer IndexKey}]` ? FieldKey extends keyof T ? FieldWithPossiblyUndefined<GetIndexedField<Exclude<T[FieldKey], undefined>, IndexKey> | Extract<T[FieldKey], undefined>, Right> : undefined : undefined : P extends keyof T ? T[P] : P extends `${infer FieldKey}[${infer IndexKey}]` ? FieldKey extends keyof T ? GetIndexedField<Exclude<T[FieldKey], undefined>, IndexKey> | Extract<T[FieldKey], undefined> : undefined : undefined;
type NestedKeyOf<T> = T extends object ? {
    [K in keyof T & (string | number)]: NonNullable<T[K]> extends object ? NonNullable<T[K]> extends Function ? `${K}` : `${K}` | `${K}.${NestedKeyOf<NonNullable<T[K]>>}` : `${K}`;
}[keyof T & (string | number)] : never;

declare function convertQueryParamKeysToKabobCase<T extends object>(obj: T): {
    [k: string]: any;
};
declare function convertQueryParamKeysFromKabobCase<T extends object>(obj: T): {
    [k: string]: any;
};
declare function getValue<TData, TPath extends string, TDefault = GetFieldType<TData, TPath>>(data: TData, path: TPath, defaultValue?: TDefault): GetFieldType<TData, TPath> | TDefault;
declare function Nullable<T extends TSchema>(schema: T): TUnsafe<Static<T> | null>;
declare function noAdditionalPropertiesInSchema<T extends TSchema>(schema: T): T;
declare function withDefaultsForStringFormats<T extends TSchema>(schema: T): T;
declare function withNoStringFormats<T extends TSchema>(schema: T): T;
declare function withNoEnumValues<T extends TSchema>(schema: T): T;
declare function withDatesAsDateTimeStrings<T extends TSchema>(schema: T): T;
declare function noEmptyStringValues<T extends object>(obj: T): Partial<T>;
declare function noAdditionalProperties<T, I>(schema: T, input: I): I;
declare function shallowSchemaProperties<T extends TObject>(schema: T): T & {
    properties: {
        [k: string]: TSchema;
    };
};
declare function undefinedToNull<T extends object>(input: T): {
    [k: string]: any;
};
declare function trueFalseStringsToBoolean<T extends object>(input: T): {
    [k: string]: any;
};
declare function cast<T extends TSchema>(schema: T, value: unknown): Static<T>;

export { type FieldWithPossiblyUndefined, type GetFieldType, type GetIndexedField, type GetLeft, type IsDotSeparated, type NestedKeyOf, Nullable, cast, convertQueryParamKeysFromKabobCase, convertQueryParamKeysToKabobCase, getValue, noAdditionalProperties, noAdditionalPropertiesInSchema, noEmptyStringValues, shallowSchemaProperties, trueFalseStringsToBoolean, undefinedToNull, withDatesAsDateTimeStrings, withDefaultsForStringFormats, withNoEnumValues, withNoStringFormats };
