import { Service, Controller } from "../../src/server";
import { User } from "../models/user";

const controller = new Controller({
  tags: ["example"],
});

controller.addOperation(
  {
    name: "CreateUser",
    method: "post",
    path: "/users",
    req: User.schemas.create,
    res: User.schemas.model,
  },
  async (ctx, next) => {
    // ctx.request.body is validated and type inferred as User.schemas.create
    // Create and return the user
    return next();
  }
);

const service = new Service({
  title: "example",
  description: "Example service",
  version: "1.0.0",
  controllers: [controller],
});

service.start(3000);
