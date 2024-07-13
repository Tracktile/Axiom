import { Controller } from "./controller";
import { testController } from "./test/test-controller";
import { T } from "../common";

const controller = new Controller();
controller.addOperation(
  {
    name: "Test",
    method: "get",
    path: "/",
    res: T.Object({
      hello: T.String(),
    }),
  },
  async (ctx, next) => {
    ctx.body = { hello: "world" };
    await next();
  }
);

describe("Controller", () => {
  it("should be a testable controller", async () => {
    const resp = await testController(controller).get("/");
    expect(resp.status).toBe(200);
    expect(resp.body).toMatchObject({ hello: "world" });
  });
});
