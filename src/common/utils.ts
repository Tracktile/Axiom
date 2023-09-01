import { Type, Static, TSchema, TypeGuard } from "@sinclair/typebox";

export function Nullable<T extends TSchema>(schema: T) {
  return Type.Unsafe<Static<T> | null>({ ...schema, nullable: true });
}

export function removeAdditionalProperties<T extends TSchema>(schema: T): T {
  if (TypeGuard.TArray(schema)) {
    return { ...schema, items: removeAdditionalProperties(schema.items) };
  }
  if (TypeGuard.TObject(schema)) {
    return {
      ...schema,
      additionalProperties: false,
      properties: Object.fromEntries(
        Object.entries(schema.properties).map(([key, value]) => [
          key,
          removeAdditionalProperties(value),
        ])
      ),
    };
  }
  return schema;
}

export function noAdditionalProperties<T extends TSchema>(schema: T): T {
  if (TypeGuard.TObject(schema)) {
    return { ...schema, additionalProperties: false };
  }
  return schema;
}
