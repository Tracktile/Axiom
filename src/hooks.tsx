import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, PropsWithChildren } from "react";
import { TSchema } from "@sinclair/typebox";

import { createApi, ModelFactoryMap } from "./api";
import { ModelFactory } from "./model";

type GenericModelFactoryMap = ModelFactoryMap<ModelFactory<TSchema>, TSchema>;

type ApiContextData<Models extends GenericModelFactoryMap> = {
  api: Models;
};

const ApiContext = createContext<ApiContextData<GenericModelFactoryMap> | null>(
  null
);

type MyProviderProps<Models extends GenericModelFactoryMap> = {
  models: Models;
  baseUrl: string;
  client?: QueryClient;
};

export function ApiProvider<Models extends GenericModelFactoryMap>({
  client = new QueryClient(),
  baseUrl,
  models,
  children,
}: PropsWithChildren<MyProviderProps<GenericModelFactoryMap>>) {
  const api = createApi({
    client,
    models: models as Models,
    baseUrl,
  });
  return (
    <QueryClientProvider client={client}>
      <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>;
    </QueryClientProvider>
  );
}

export function useApi<Models extends GenericModelFactoryMap>() {
  const context = useContext<ApiContextData<Models>>(
    ApiContext as unknown as React.Context<ApiContextData<Models>>
  );
  if (!context) {
    throw new Error("useMyContext must be used under MyContextProvider");
  }
  return context;
}
