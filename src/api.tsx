import { TSchema } from "@sinclair/typebox";
import { QueryClient } from "@tanstack/react-query";

import { Model } from "./model";
import { MutableRefObject } from "react";

type SearchQueryField = {
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

export type ModelMap<
  M extends Record<string, Model<TSchema, TSchema, TSchema, TSchema, TSchema>>,
> = {
  [K in keyof M]: M[K];
};

interface CreateApiOptions<
  M extends Record<string, Model<TSchema, TSchema, TSchema, TSchema, TSchema>>,
> {
  client: QueryClient;
  baseUrl: string;
  models: M;
  token: MutableRefObject<string | null>;
}

export function createApi<
  M extends Record<string, Model<TSchema, TSchema, TSchema, TSchema, TSchema>>,
>({ models, client, baseUrl, token }: CreateApiOptions<M>) {
  return Object.keys(models).reduce(
    (acc, key) => ({
      ...acc,
      [key as keyof M]: models[key as keyof M].bind({
        client,
        baseUrl,
        token,
      }),
    }),
    {} as ModelMap<M>
  );
}
