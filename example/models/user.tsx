import { createApiModel, Type, Static } from "../../src";

export const User = createApiModel({
  name: "User",
  resource: "/users",
  idKey: "id",
  model: Type.Object({
    id: Type.String(),
    email: Type.String(),
    name: Type.String(),
    status: Type.String(),
  }),
  create: Type.Object({
    name: Type.String(),
    email: Type.String(),
  }),
  update: Type.Object({
    name: Type.String(),
  }),
  query: Type.Object({
    name: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
  }),
  params: Type.Object({
    name: Type.Optional(Type.String()),
  }),
});

export type User = Static<typeof User.schemas.model>;
