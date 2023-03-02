import { QueryClient } from "@tanstack/react-query";
import { TSchema } from "@sinclair/typebox";

import { Model, ModelFactory } from "./model";

export type ModelFactoryMap<T extends ModelFactory<S>, S extends TSchema> = {
  [K in keyof T]: ModelFactory<S>;
};

export type ModelMap<M extends Record<string, ModelFactory<any>>> = {
  [K in keyof M]: ReturnType<M[K]>;
};

export function createApi<M extends Record<string, ModelFactory<any>>>({
  client,
  baseUrl,
  models,
}: {
  client: QueryClient;
  models: M;
  baseUrl: string;
}): ModelMap<M> {
  return Object.keys(models).reduce(
    (acc, key) => ({
      ...acc,
      [key as keyof M]: models[key as keyof M](client),
    }),
    {} as ModelMap<M>
  );
}
