import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  useContext,
  PropsWithChildren,
  useRef,
} from "react";

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
  token?: string;
};

export function ApiProvider<M extends Record<string, ModelFactory<any>>>({
  client = new QueryClient(),
  baseUrl,
  models,
  children,
  token,
}: PropsWithChildren<ApiProviderProps<M>>) {
  const tokenRef = useRef<string | null>(token ?? null);
  tokenRef.current = token ?? null;
  const api = createApi<M>({
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
  M extends Record<string, ModelFactory<any>>
>() {
  return function ApiProviderHook(
    props: PropsWithChildren<ApiProviderProps<M>>
  ) {
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
