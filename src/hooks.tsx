import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, PropsWithChildren } from "react";

import { ModelFactory } from "./model";
import { createApi, ModelMap } from "./api";

type ApiContextData<M extends Record<string, ModelFactory<any>>> = {
  api: ModelMap<M>;
};

const ApiContext = createContext<ApiContextData<{}> | null>(null);

type ApiProviderProps<M extends Record<string, ModelFactory<any>>> = {
  models: M;
  baseUrl: string;
  client?: QueryClient;
};

export function ApiProvider<M extends Record<string, ModelFactory<any>>>({
  client = new QueryClient(),
  baseUrl,
  models,
  children,
}: PropsWithChildren<ApiProviderProps<M>>) {
  const api = createApi<M>({
    client,
    models,
    baseUrl,
  });
  return (
    <QueryClientProvider client={client}>
      <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>;
    </QueryClientProvider>
  );
}

export function createApiProvider<
  M extends Record<string, ModelFactory<any>>
>() {
  return function ApiProviderHook(props: ApiProviderProps<M>) {
    return <ApiProvider {...props} />;
  };
}

function useApi<M extends Record<string, ModelFactory<any>>>() {
  const context = useContext<ApiContextData<M> | null>(
    ApiContext as unknown as React.Context<ApiContextData<M> | null>
  );
  if (!context) {
    throw new Error("useApiContext must be used under ApiContextProvider");
  }

  return context.api;
}

export function createUseApiHook<
  M extends Record<string, ModelFactory<any>>
>() {
  return function useApiHook() {
    return useApi<M>();
  };
}
