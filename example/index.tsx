import { QueryClient } from "@tanstack/react-query";

import { createApi } from "../src/api";
import { User } from "./models/user";

const api = createApi(new QueryClient(), {
  User,
});

export default api;
