import React from "react";
import { QueryClient } from "@tanstack/react-query";

import { User } from "./models/user";
import { ApiProvider, createApi, useApi } from "../src";

// const models = { User };

// function Users() {
//   const api = useApi<typeof models>();
//   const { data: users, isLoading } = api.User.search();
//   return null;
// }

// function App() {
//   return (
//     <ApiProvider models={models} baseUrl="">
//       <Users />
//     </ApiProvider>
//   );
// }

// export default App;

const direct = createApi({
  client: new QueryClient(),
  baseUrl: "",
  models: { User },
});

User.schema;
direct.User.schema;

const { data, isLoading } = direct.User.get(1);
