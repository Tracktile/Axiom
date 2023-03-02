import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, PropsWithChildren } from "react";
import { TSchema } from "@sinclair/typebox";

import { ModelFactory } from "./model";
import {
  createApi,
  ModelMap,
  ModelFactoryMap,
  UnwrapFactorySchemas,
  UnwrapModelFactories,
} from "./api";

type ApiContextData<
  M extends ModelFactoryMap<T, S>,
  T extends ModelFactory<S> = UnwrapModelFactories<M>,
  S extends TSchema = UnwrapFactorySchemas<T>
> = {
  api: ModelMap<M, T, S>;
};

const ApiContext = createContext<ApiContextData<{}> | null>(null);

type ApiProviderProps<
  M extends ModelFactoryMap<T, S>,
  T extends ModelFactory<S> = UnwrapModelFactories<M>,
  S extends TSchema = UnwrapFactorySchemas<T>
> = {
  models: M;
  baseUrl: string;
  client?: QueryClient;
};

export function ApiProvider<
  M extends ModelFactoryMap<T, S>,
  T extends ModelFactory<S> = UnwrapModelFactories<M>,
  S extends TSchema = UnwrapFactorySchemas<T>
>({
  client = new QueryClient(),
  baseUrl,
  models,
  children,
}: PropsWithChildren<ApiProviderProps<M, T, S>>) {
  const api = createApi<M, T, S>({
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

export function useApi<
  M extends ModelFactoryMap<T, S>,
  T extends ModelFactory<S> = UnwrapModelFactories<M>,
  S extends TSchema = UnwrapFactorySchemas<T>
>() {
  const context = useContext<ApiContextData<M, T, S> | null>(
    ApiContext as unknown as React.Context<ApiContextData<M, T, S> | null>
  );
  if (!context) {
    throw new Error("useApiContext must be used under ApiContextProvider");
  }

  return context.api;
}
