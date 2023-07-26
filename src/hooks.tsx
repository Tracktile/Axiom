import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  useContext,
  PropsWithChildren,
  useRef,
} from "react";
import { TSchema } from "@sinclair/typebox";

import { Model } from "./model";
import { createApi, ModelMap } from "./api";

type ApiContextData<
  M extends Record<string, Model<TSchema, TSchema, TSchema, TSchema, TSchema>>,
> = {
  api: ModelMap<M>;
};

const ApiContext = createContext<ApiContextData<{}> | null>(null);

type ApiProviderProps<
  M extends Record<string, Model<TSchema, TSchema, TSchema, TSchema, TSchema>>,
> = {
  models: M;
  baseUrl: string;
  client?: QueryClient;
  token?: string;
};

function ApiProvider<
  M extends Record<string, Model<TSchema, TSchema, TSchema, TSchema, TSchema>>,
>({
  client = new QueryClient(),
  baseUrl,
  models,
  children,
  token,
}: PropsWithChildren<ApiProviderProps<M>>) {
  const tokenRef = useRef<string | null>(token ?? null);
  tokenRef.current = token ?? null;
  const api = createApi({
    client,
    models,
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
  M extends Record<string, Model<any, any, any, any, any>>,
>({ models }: { models: M }) {
  return function ApiProviderHook(
    props: PropsWithChildren<ApiProviderProps<M>>
  ) {
    return <ApiProvider {...props} />;
  };
}

function useApi<
  M extends Record<string, Model<TSchema, TSchema, TSchema, TSchema, TSchema>>,
>() {
  const context = useContext<ApiContextData<M> | null>(
    ApiContext as unknown as React.Context<ApiContextData<M> | null>
  );
  if (!context) {
    throw new Error("useApiContext must be used under ApiContextProvider");
  }

  return context.api;
}

export function createUseApiHook<
  M extends Record<string, Model<any, any, any, any, any>>,
>({ models }: { models: M }) {
  return function useApiHook() {
    return useApi<M>();
  };
}
