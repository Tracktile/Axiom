import { Type, Static, TSchema, TypeGuard, TObject } from "@sinclair/typebox";

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
