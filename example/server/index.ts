import { T } from "../../src/common";
import { Service, Controller } from "../../src/server";

const controller = new Controller({
  tags: ["example"],
});

controller.addOperation(
  {
    name: "GetExample",
    method: "get",
    path: "/example",
    req: T.Object({
      testString: T.String(),
    }),
    res: T.Object({
      message: T.String(),
    }),
  },
  async (ctx, next) => {
    ctx.body = { message: ctx.request.body.testString };
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
