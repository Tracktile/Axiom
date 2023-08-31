import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  PropsWithChildren,
  useRef,
  useContext,
} from "react";

import { TSchema, Model, Procedure } from "../common";
import { createApi, ReactModelMap, ReactProcedureMap } from "./api";

type ApiContextData<
  M extends Record<
    string,
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>
  >,
  P extends Record<string, Procedure<TSchema, TSchema>>,
> = {
  api: ReactModelMap<M> & ReactProcedureMap<P>;
};

const ApiContext = createContext<ApiContextData<
  Record<
    string,
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>
  >,
  Record<string, Procedure<TSchema, TSchema>>
> | null>(null);

type ApiProviderProps<
  M extends Record<
    string,
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>
  >,
  P extends Record<string, Procedure<TSchema, TSchema>>,
> = {
  models?: M;
  fns?: P;
  baseUrl: string;
  client?: QueryClient;
  token?: string;
};

function ApiProvider<
  M extends Record<
    string,
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>
  >,
  P extends Record<string, Procedure<TSchema, TSchema>>,
>({
  client = new QueryClient(),
  baseUrl,
  models = {} as M,
  fns = {} as P,
  children,
  token,
}: PropsWithChildren<ApiProviderProps<M, P>>) {
  const tokenRef = useRef<string | null>(token ?? null);
  tokenRef.current = token ?? null;
  const api = createApi({
    client,
    models,
    fns,
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
  P extends Record<string, Procedure<any, any>>,
>({ models = {} as M, fns = {} as P }: { models?: M; fns?: P }) {
  return function ApiProviderHook(
    props: PropsWithChildren<ApiProviderProps<M, P>>
  ) {
    return <ApiProvider {...props} models={models} fns={fns} />;
  };
}

function useApi<
  M extends Record<
    string,
    Model<TSchema, TSchema, TSchema, TSchema, TSchema, TSchema, any>
  > = {},
  P extends Record<string, Procedure<TSchema, TSchema>> = {},
>() {
  const context = useContext<ApiContextData<M, P> | null>(
    ApiContext as unknown as React.Context<ApiContextData<M, P> | null>
  );
  if (!context) {
    throw new Error("useApiContext must be used under ApiContextProvider");
  }

  return context.api;
}

export function createUseApiHook<
  M extends Record<string, Model<any, any, any, any, any, any, any>>,
  P extends Record<string, Procedure<any, any>>,
>({}: { models?: M; fns?: P }) {
  return function useApiHook() {
    return useApi<M, P>();
  };
}
