import { TSchema } from "@sinclair/typebox";
import { QueryClient } from "@tanstack/react-query";

import { Model } from "./model";
import { MutableRefObject } from "react";
import { Procedure } from "./procedure";

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

export type ProcedureMap<
  P extends Record<string, Procedure<TSchema, TSchema>>,
> = {
  [K in keyof P]: P[K];
};

interface CreateApiOptions<
  M extends Record<string, Model<TSchema, TSchema, TSchema, TSchema, TSchema>>,
  P extends Record<string, Procedure<TSchema, TSchema>>,
> {
  client: QueryClient;
  baseUrl: string;
  models: M;
  fns: P;
  token: MutableRefObject<string | null>;
}

export function createApi<
  M extends Record<string, Model<TSchema, TSchema, TSchema, TSchema, TSchema>>,
  P extends Record<string, Procedure<TSchema, TSchema>>,
>({ models, fns, client, baseUrl, token }: CreateApiOptions<M, P>) {
  return {
    ...Object.keys(models).reduce(
      (acc, key) => ({
        ...acc,
        [key as keyof M]: models[key as keyof M].bind({
          client,
          baseUrl,
          token,
        }),
      }),
      {} as ModelMap<M>
    ),
    ...Object.keys(fns).reduce(
      (acc, key) => ({
        ...acc,
        [key as keyof P]: fns[key as keyof P].bind({
          client,
          baseUrl,
          token,
        }),
      }),
      {} as P
    ),
  };
}
