import { Type, Static, TSchema, TypeGuard } from "@sinclair/typebox";

export function Nullable<T extends TSchema>(schema: T) {
  return Type.Unsafe<Static<T> | null>({ ...schema, nullable: true });
}

export function noAdditionalProperties<T extends TSchema>(schema: T): T {
  if (TypeGuard.TArray(schema)) {
    return { ...schema, items: noAdditionalProperties(schema.items) };
  }
  if (TypeGuard.TObject(schema)) {
    return {
      ...schema,
      additionalProperties: false,
      properties: Object.fromEntries(
        Object.entries(schema.properties).map(([key, value]) => [
          key,
          noAdditionalProperties(value),
        ])
      ),
    };
  }
  return schema;
}

export function noStringFormats<T extends TSchema>(schema: T): T {
  if (TypeGuard.TArray(schema)) {
    return { ...schema, items: noStringFormats(schema.items) };
  }
  if (TypeGuard.TObject(schema)) {
    return {
      ...schema,
      properties: Object.fromEntries(
        Object.entries(schema.properties).map(([key, value]) => [
          key,
          noStringFormats(value),
        ])
      ),
    };
  }
  if (TypeGuard.TString(schema)) {
    return { ...schema, format: undefined };
  }
  return schema;
}

export function noEmptyStringValues<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    if (val !== "") {
      return { ...acc, [key]: val };
    }
    return acc;
  }, {} as Partial<T>);
}
