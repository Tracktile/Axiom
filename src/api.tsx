import { TSchema } from "@sinclair/typebox";

import { ModelFactory, ModelFactoryOptions } from "./model";

export type SearchQueryField = {
  name: string;
  is?: string;
  contains?: string;
  isOneOf?: string[];
};

export type SearchQuery = {
  fields?: SearchQueryField[];
  offset?: number;
  limit?: number;
  orderBy?: string;
};

export type ModelFactoryMap<T extends ModelFactory<S>, S extends TSchema> = {
  [K in keyof T]: ModelFactory<S>;
};

export type ModelMap<M extends Record<string, ModelFactory<any>>> = {
  [K in keyof M]: ReturnType<M[K]>;
};

interface CreateApiOptions<M extends Record<string, ModelFactory<any>>>
  extends ModelFactoryOptions {
  models: M;
}

export function createApi<M extends Record<string, ModelFactory<any>>>({
  models,
  client,
  baseUrl,
  token,
}: CreateApiOptions<M>): ModelMap<M> {
  return Object.keys(models).reduce(
    (acc, key) => ({
      ...acc,
      [key as keyof M]: models[key as keyof M]({
        client,
        baseUrl,
        token,
      }),
    }),
    {} as ModelMap<M>
  );
}
