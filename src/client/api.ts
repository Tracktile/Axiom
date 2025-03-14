import { QueryClient } from "@tanstack/react-query";
import { MutableRefObject } from "react";

import { Model, Procedure, Resource, TSchema } from "../common";
import { ReactModel } from "./model";
import { ReactProcedure } from "./procedure";
import { ReactResource } from "./resource";

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
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any, TSchema>
  >,
> = {
  [K in keyof M]: ReactModel<
    M[K],
    M[K]["schemas"]["model"],
    M[K]["schemas"]["create"],
    M[K]["schemas"]["update"],
    M[K]["transformer"],
    M[K]["sortableBy"]
  >;
};

export type ProcedureMap<
  P extends Record<string, Procedure<TSchema, TSchema, TSchema>>,
> = {
  [K in keyof P]: P[K];
};

export type ReactProcedureMap<
  P extends Record<string, Procedure<TSchema, TSchema, TSchema>>,
> = {
  [K in keyof P]: ReactProcedure<P[K]>;
};

export type ResourceMap<P extends Record<string, Resource<TSchema, TSchema>>> =
  {
    [K in keyof P]: P[K];
  };

export type ReactResourceMap<
  R extends Record<string, Resource<TSchema, TSchema>>,
> = {
  [K in keyof R]: ReactResource<R[K]>;
};

interface CreateApiOptions<
  M extends Record<
    string,
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>
  >,
  P extends Record<string, Procedure<TSchema, TSchema, TSchema>>,
  R extends Record<string, Resource<TSchema, TSchema>>,
> {
  client: QueryClient;
  baseUrl: string;
  models: M;
  fns: P;
  resources: R;
  token: MutableRefObject<string | null>;
}

export function createApi<
  M extends Record<
    string,
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any, TSchema>
  >,
  P extends Record<string, Procedure<TSchema, TSchema, TSchema>>,
  R extends Record<string, Resource<TSchema, TSchema>>,
>({
  models,
  fns,
  resources,
  client,
  baseUrl,
  token,
}: CreateApiOptions<M, P, R>): ReactModelMap<M> &
  ReactProcedureMap<P> &
  ReactResourceMap<R> {
  return {
    ...Object.keys(models).reduce(
      (acc, key) => ({
        ...acc,
        [key as keyof M]: new ReactModel<
          M[keyof M],
          M[keyof M]["schemas"]["model"],
          M[keyof M]["schemas"]["create"],
          M[keyof M]["schemas"]["update"],
          M[keyof M]["transformer"],
          M[keyof M]["sortableBy"]
        >({
          baseUrl,
          model: models[key as keyof M],
          _unstable_offlineModel: models[key as keyof M]._unstable_offlineModel,
        }).bind({
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
    ...Object.keys(resources).reduce(
      (acc, key) => ({
        ...acc,
        [key as keyof R]: new ReactResource<R[keyof R]>({
          resource: resources[key as keyof R],
        }).bind({
          client,
          baseUrl,
          token,
        }),
      }),
      {} as ReactResourceMap<R>
    ),
  };
}
