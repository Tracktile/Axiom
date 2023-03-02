import { QueryClient } from "@tanstack/react-query";
import { TSchema } from "@sinclair/typebox";

import { Model, ModelFactory } from "./model";

export type ModelFactoryMap<T extends ModelFactory<S>, S extends TSchema> = {
  [K in keyof T]: ModelFactory<S>;
};

// export type UnwrapModelFactories<T> = T extends ModelFactoryMap<
//   infer S,
//   infer U
// >
//   ? ModelFactory<U>
//   : never;

// export type UnwrapFactorySchemas<T> = T extends ModelFactory<infer S>
//   ? S
//   : never;

export type ModelMap<
  M extends ModelFactoryMap<T, S>,
  T extends ModelFactory<S>,
  S extends TSchema
> = {
  [K in keyof M]: Model<S>;
};

export function createApi<
  M extends ModelFactoryMap<T, S>,
  T extends ModelFactory<S>,
  S extends TSchema
>({
  client,
  baseUrl,
  models,
}: {
  client: QueryClient;
  models: M;
  baseUrl: string;
}): ModelMap<M, T, S> {
  return Object.keys(models).reduce(
    (acc, key) => ({
      ...acc,
      [key as keyof M]: models[key as keyof M](client) as Model<S>,
    }),
    {} as ModelMap<M, T, S>
  );
}
