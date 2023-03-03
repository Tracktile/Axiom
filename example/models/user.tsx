import { createApiModel, Type, Static } from "../../src";

export const User = createApiModel({
  name: "User",
  resource: "/users",
  schema: Type.Object({
    id: Type.String(),
    email: Type.String(),
    name: Type.String(),
    status: Type.String(),
  }),
});

export type User = Static<typeof User.schema>;
