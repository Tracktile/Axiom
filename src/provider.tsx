import React, { createContext, PropsWithChildren } from "react";

type ApiContextType = {
  api: Record<string, any>;
};

export const ApiContext = createContext<ApiContextType>({ api: {} });

export const ApiProvider = ({ children }: PropsWithChildren<{}>) => (
  <ApiContext.Provider value={{ api: {} }}>{children}</ApiContext.Provider>
);
