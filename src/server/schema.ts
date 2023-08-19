import { TSchema, TypeGuard } from "@sinclair/typebox";

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
