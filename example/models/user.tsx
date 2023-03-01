import { Type } from "@sinclair/typebox";
import { createApiModel } from "../../src/model";

export const User = createApiModel({
  name: "User",
  resource: "/users",
  schema: Type.Object({
    id: Type.String(),
    sbmDomain: Type.String(),
    sbmAccountId: Type.Number(),
    email: Type.String(),
    sbmUserId: Type.Optional(Type.Number()),
    appUserId: Type.Optional(Type.String()),
    firstName: Type.String(),
    lastName: Type.String(),
    enabled: Type.Boolean(),
  }),
});
