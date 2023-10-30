import { createProcedure, T } from "../../../src";

export const SendEvent = createProcedure({
  name: "SendEvent",
  resource: "/events",
  params: T.Object({
    name: T.Union([T.Literal("user-created"), T.Literal("user-removed")]),
    userId: T.String({ format: "uuid" }),
    time: T.Date({ format: "date-time" }),
  }),
  result: T.Boolean(),
});
