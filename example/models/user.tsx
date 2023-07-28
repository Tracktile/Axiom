import { createModel, T, Static } from "../../src";

export const User = createModel({
  name: "User",
  resource: "/users",
  idKey: "id",
  model: T.Object({
    id: T.String(),
    email: T.String(),
    name: T.String(),
    status: T.String(),
  }),
  create: T.Object({
    name: T.String(),
    email: T.String(),
  }),
  update: T.Object({
    name: T.String(),
  }),
  query: T.Object({
    name: T.Optional(T.String()),
    email: T.Optional(T.String()),
  }),
  params: T.Object({
    name: T.Optional(T.String()),
  }),
});

export type User = Static<typeof User.schemas.model>;
