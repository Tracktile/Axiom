import React from "react";
import { QueryClient } from "@tanstack/react-query";

import { User } from "./models/user";
import { ApiProvider, createApi, createUseApiHook } from "../src";

const models = { User };

const useApi = createUseApiHook<typeof models>();

function Users() {
  const api = useApi();
  const { data: users, isLoading } = api.User.search();
  return null;
}

function App() {
  return (
    <ApiProvider models={models} baseUrl="">
      <Users />
    </ApiProvider>
  );
}

export default App;
