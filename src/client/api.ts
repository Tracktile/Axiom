import { QueryClient } from "@tanstack/react-query";
import { MutableRefObject } from "react";

import { TSchema, Model, Procedure, Static } from "../common";

import { ReactModel } from "./model";
import { ReactProcedure } from "./procedure";

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
  M extends Record<
    string,
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>
  >,
> = {
  [K in keyof M]: M[K];
};

export type ReactModelMap<
  M extends Record<
    string,
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>
  >,
> = {
  [K in keyof M]: ReactModel<M[K], M[K]["transformer"]>;
};

export type ProcedureMap<
  P extends Record<string, Procedure<TSchema, TSchema>>,
> = {
  [K in keyof P]: P[K];
};

export type ReactProcedureMap<
  P extends Record<string, Procedure<TSchema, TSchema>>,
> = {
  [K in keyof P]: ReactProcedure<P[K]>;
};

interface CreateApiOptions<
  M extends Record<
    string,
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>
  >,
  P extends Record<string, Procedure<TSchema, TSchema>>,
> {
  client: QueryClient;
  baseUrl: string;
  models: M;
  fns: P;
  token: MutableRefObject<string | null>;
}

export function createApi<
  M extends Record<
    string,
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>
  >,
  P extends Record<string, Procedure<TSchema, TSchema>>,
>({
  models,
  fns,
  client,
  baseUrl,
  token,
}: CreateApiOptions<M, P>): ReactModelMap<M> & ReactProcedureMap<P> {
  return {
    ...Object.keys(models).reduce(
      (acc, key) => ({
        ...acc,
        [key as keyof M]: new ReactModel<M[keyof M], M[keyof M]["transformer"]>(
          {
            baseUrl: baseUrl,
            model: models[key as keyof M],
          }
        ).bind({
          client,
          baseUrl,
          token,
        }),
      }),
      {} as ReactModelMap<M>
    ),
    ...Object.keys(fns).reduce(
      (acc, key) => ({
        ...acc,
        [key as keyof P]: new ReactProcedure({
          procedure: fns[key as keyof P],
        }).bind({
          client,
          baseUrl,
          token,
        }),
      }),
      {} as ReactProcedureMap<P>
    ),
  };
}
