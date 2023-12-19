import { Type, Static, TSchema, TypeGuard, TObject } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { GetFieldType } from "./types";

export function convertQueryParamKeysToKabobCase<T extends object>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [key.replace(/0/g, "."), val])
  );
}

export function convertQueryParamKeysFromKabobCase<T extends object>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [key.replace(/\,/g, "-"), val])
  );
}

export function getValue<
  TData,
  TPath extends string,
  TDefault = GetFieldType<TData, TPath>,
>(
  data: TData,
  path: TPath,
  defaultValue?: TDefault
): GetFieldType<TData, TPath> | TDefault {
  const value = path
    .split(/[.[\]]/)
    .filter(Boolean)
    .reduce<GetFieldType<TData, TPath>>(
      (value, key) => (value as any)?.[key],
      data as any
    );

  return value !== undefined ? value : (defaultValue as TDefault);
}

export function Nullable<T extends TSchema>(schema: T) {
  return Type.Unsafe<Static<T> | null>({ ...schema, nullable: true });
}

export function noAdditionalPropertiesInSchema<T extends TSchema>(
  schema: T
): T {
  if (TypeGuard.TArray(schema)) {
    return { ...schema, items: noAdditionalPropertiesInSchema(schema.items) };
  }
  if (TypeGuard.TObject(schema)) {
    return {
      ...schema,
      additionalProperties: false,
      properties: Object.fromEntries(
        Object.entries(schema.properties).map(([key, value]) => [
          key,
          noAdditionalPropertiesInSchema(value),
        ])
      ),
    };
  }
  return schema;
}

export function withDefaultsForStringFormats<T extends TSchema>(schema: T): T {
  if (TypeGuard.TArray(schema)) {
    return { ...schema, items: withDefaultsForStringFormats(schema.items) };
  }
  if (TypeGuard.TObject(schema)) {
    return {
      ...schema,
      properties: Object.fromEntries(
        Object.entries(schema.properties).map(([key, value]) => [
          key,
          withDefaultsForStringFormats(value),
        ])
      ),
    };
  }
  if (TypeGuard.TString(schema) && typeof schema.format !== "undefined") {
    return {
      ...schema,
      default: "",
    };
  }
  return schema;
}

export function withNoStringFormats<T extends TSchema>(schema: T): T {
  if (TypeGuard.TArray(schema)) {
    return { ...schema, items: withNoStringFormats(schema.items) };
  }
  if (TypeGuard.TObject(schema)) {
    return {
      ...schema,
      properties: Object.fromEntries(
        Object.entries(schema.properties).map(([key, value]) => [
          key,
          withNoStringFormats(value),
        ])
      ),
    };
  }
  if (TypeGuard.TString(schema) && typeof schema.format !== "undefined") {
    return {
      ...schema,
      format: undefined,
    };
  }
  return schema;
}

export function withNoEnumValues<T extends TSchema>(schema: T): T {
  if (TypeGuard.TArray(schema)) {
    return { ...schema, items: withNoEnumValues(schema.items) };
  }
  if (TypeGuard.TObject(schema)) {
    return {
      ...schema,
      properties: Object.fromEntries(
        Object.entries(schema.properties)
          .filter(([, value]) => {
            return !TypeGuard.TUnion(value);
          })
          .map(([key, value]) => [key, withNoEnumValues(value)])
      ),
    };
  }
  return schema;
}

export function withDatesAsDateTimeStrings<T extends TSchema>(schema: T): T {
  if (TypeGuard.TArray(schema)) {
    return { ...schema, items: withDatesAsDateTimeStrings(schema.items) };
  }
  if (TypeGuard.TObject(schema)) {
    return {
      ...schema,
      properties: Object.fromEntries(
        Object.entries(schema.properties).map(([key, value]) => [
          key,
          withDatesAsDateTimeStrings(value),
        ])
      ),
    };
  }
  if (TypeGuard.TDate(schema)) {
    return {
      ...schema,
      type: "string",
      format: "date-time",
    };
  }
  return schema;
}

export function noEmptyStringValues<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    if (val !== "") {
      return { ...acc, [key]: val };
    }
    return acc;
  }, {} as Partial<T>);
}

export function noAdditionalProperties<T, I>(schema: T, input: I): I {
  if (TypeGuard.TArray(schema) && Array.isArray(input)) {
    return input.map(
      (item) => noAdditionalProperties(schema.items, item) as unknown as T
    ) as I;
  }
  if (
    TypeGuard.TObject(schema) &&
    typeof input === "object" &&
    input !== null
  ) {
    const prunedInput: Partial<I> = {};
    for (const [key, value] of Object.entries(input)) {
      if (key in schema.properties) {
        prunedInput[key as keyof I] = noAdditionalProperties(
          schema.properties[key],
          value
        );
      }
    }
    return prunedInput as I;
  }
  return input;
}

export function shallowSchemaProperties<T extends TObject>(schema: T) {
  return {
    ...schema,
    properties: Object.fromEntries(
      Object.entries(schema.properties).filter(
        ([, prop]) => !TypeGuard.TArray(prop) && !TypeGuard.TObject(prop)
      )
    ),
  };
}

export function undefinedToNull<T extends object>(input: T) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      value === undefined ? null : value,
    ])
  );
}

export function trueFalseStringsToBoolean<T extends object>(input: T) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      value === "true" ? true : value === "false" ? false : value,
    ])
  );
}

export function cast<T extends TSchema>(schema: T, value: unknown) {
  return Value.Cast(schema, value);
}
