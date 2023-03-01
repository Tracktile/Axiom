import { QueryClient } from "@tanstack/react-query";

import { createApi } from "../src/api";
import { User } from "./models/user";

const api = createApi({
  client: new QueryClient(),
  models: {
    User,
  },
  baseUrl: "https://jsonplaceholder.typicode.com/User",
});

export default api;
