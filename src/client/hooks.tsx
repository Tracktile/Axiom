import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useRef,
} from "react";

import { Model, Procedure, Resource, TSchema } from "../common";
import {
  createApi,
  ReactModelMap,
  ReactProcedureMap,
  ReactResourceMap,
} from "./api";

const emptyModelMap: Record<
  string,
  Model<any, any, any, any, any, any, any>
> = {};

const emptyProcedureMap: Record<string, Procedure<any, any, any>> = {};

const emptyResourceMap: Record<string, Resource<any, any>> = {};

type ApiContextData<
  M extends Record<
    string,
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>
  >,
  P extends Record<string, Procedure<TSchema, TSchema, TSchema>>,
  R extends Record<string, Resource<TSchema, TSchema>>,
> = {
  api: ReactModelMap<M> & ReactProcedureMap<P> & ReactResourceMap<R>;
};

const ApiContext = createContext<ApiContextData<
  Record<
    string,
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>
  >,
  Record<string, Procedure<TSchema, TSchema, TSchema>>,
  Record<string, Resource<TSchema, TSchema>>
> | null>(null);

type ApiProviderProps<
  M extends Record<
    string,
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>
  >,
  P extends Record<string, Procedure<TSchema, TSchema, TSchema>>,
  R extends Record<string, Resource<TSchema, TSchema>>,
> = {
  models?: M;
  fns?: P;
  resources?: R;
  baseUrl: string;
  client?: QueryClient;
  token?: string;
};

function ApiProvider<
  M extends Record<
    string,
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>
  >,
  P extends Record<string, Procedure<TSchema, TSchema, TSchema>>,
  R extends Record<string, Resource<TSchema, TSchema>>,
>({
  client = new QueryClient(),
  baseUrl,
  models = {} as M,
  fns = {} as P,
  resources = {} as R,
  children,
  token,
}: PropsWithChildren<ApiProviderProps<M, P, R>>) {
  const tokenRef = useRef<string | null>(token ?? null);
  tokenRef.current = token ?? null;
  const api = createApi({
    client,
    models,
    fns,
    resources,
    baseUrl,
    token: tokenRef,
  });

  return (
    <QueryClientProvider client={client}>
      <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>
    </QueryClientProvider>
  );
}

export function createApiProvider<
  M extends Record<string, Model<any, any, any, any, any, any, any>>,
  P extends Record<string, Procedure<any, any, any>>,
  R extends Record<string, Resource<any, any>>,
>({
  models = {} as M,
  fns = {} as P,
  resources = {} as R,
}: {
  models?: M;
  fns?: P;
  resources?: R;
}) {
  return function ApiProviderHook(
    props: PropsWithChildren<ApiProviderProps<M, P, R>>
  ) {
    return (
      <ApiProvider {...props} models={models} fns={fns} resources={resources} />
    );
  };
}

function useApi<
  M extends Record<
    string,
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>
  > = typeof emptyModelMap,
  P extends Record<
    string,
    Procedure<TSchema, TSchema, TSchema>
  > = typeof emptyProcedureMap,
  R extends Record<
    string,
    Resource<TSchema, TSchema>
  > = typeof emptyResourceMap,
>() {
  const context = useContext<ApiContextData<M, P, R> | null>(
    ApiContext as unknown as React.Context<ApiContextData<M, P, R> | null>
  );
  if (!context) {
    throw new Error(
      "Axiom's useApi hook must be used within a child of ApiProvider."
    );
  }

  return context.api;
}

export function createUseApiHook<
  M extends Record<string, Model<any, any, any, any, any, any, any>>,
  P extends Record<string, Procedure<any, any, any>>,
  R extends Record<string, Resource<any, any>>,
  // eslint-disable-next-line no-empty-pattern
>({}: { models?: M; fns?: P; resources?: R }) {
  return function useApiHook() {
    return useApi<M, P, R>();
  };
}
