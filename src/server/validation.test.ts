import { Type } from "@sinclair/typebox";
import { testController } from "./test/test-controller";
import { Controller } from "./controller";

describe("Validation", () => {
  it("should throw a 400 BadRequestError when returning a body which does not comply with the operations response schema", async () => {
    const controller = new Controller();
    controller.addOperation(
      {
        name: "Test",
        method: "get",
        path: "/",
        res: Type.Object({
          hello: Type.String({ format: "uuid" }),
        }),
      },
      async (ctx, next) => {
        // @ts-ignore
        ctx.body = { hello: 1 };
        await next();
      }
    );
    const resp = await testController(controller).get("/");
    expect(resp.status).toBe(400);
    expect(resp.body).toMatchObject({
      message: "Invalid Response",
      errors: {
        hello: "Expected string",
      },
    });
  });

  it("should throw a 400 BadRequestError when a request body  does not comply with the operations request schema", async () => {
    const controller = new Controller();
    controller.addOperation(
      {
        name: "Test",
        method: "post",
        path: "/",
        req: Type.Object({
          hello: Type.String({ format: "uuid" }),
        }),
      },
      async (ctx, next) => {
        ctx.status = 200;
        console.log("body: ", ctx.request.body);
        ctx.body = ctx.request.body;
        await next();
      }
    );
    const resp = await testController(controller)
      .post("/")
      .send({ hello: true });
    expect(resp.status).toBe(400);
    expect(resp.body).toMatchObject({
      message: "Invalid Request",
      errors: {
        hello: "Expected string",
      },
    });
  });

  it("should throw a 400 BadRequestError when a request parameter  does not comply with the operations params schema", async () => {
    const controller = new Controller();
    controller.addOperation(
      {
        name: "Test",
        method: "post",
        path: "/:hello",
        params: Type.Object({
          hello: Type.String({ format: "uuid" }),
        }),
      },
      async (ctx, next) => {
        ctx.status = 200;
        ctx.body = ctx.request.body;
        await next();
      }
    );
    const resp = await testController(controller)
      .post("/12")
      .send({ hello: 1 });
    expect(resp.status).toBe(400);
    expect(resp.body).toMatchObject({
      message: "Invalid Request",
      errors: {
        hello: "Expected string to match 'uuid' format",
      },
    });
  });

  it("should throw a 400 BadRequestError when a request query parameter does not comply with the operations query schema", async () => {
    const controller = new Controller();
    controller.addOperation(
      {
        name: "Test",
        method: "post",
        path: "/",
        query: Type.Object({
          hello: Type.String({ format: "uuid" }),
        }),
      },
      async (ctx, next) => {
        ctx.status = 200;
        ctx.body = ctx.request.body;
        await next();
      }
    );
    const resp = await testController(controller)
      .post("/?hello=12")
      .send({ hello: 1 });
    expect(resp.status).toBe(400);
    expect(resp.body).toMatchObject({
      message: "Invalid Request",
      errors: {
        hello: "Expected string to match 'uuid' format",
      },
    });
  });

  it("should prune keys from the response body that are not included in the response schema, recursively.", async () => {
    const controller = new Controller();
    controller.addOperation(
      {
        name: "Test",
        method: "get",
        path: "/",
        res: Type.Object({
          hello: Type.String(),
          nested: Type.Object({
            hello: Type.String(),
          }),
        }),
      },
      async (ctx, next) => {
        // @ts-ignore
        ctx.body = {
          hello: "yes",
          world: "no",
          nested: {
            hello: "yes",
            // @ts-ignore
            world: "no",
          },
        };
        await next();
      }
    );
    const resp = await testController(controller).get("/");
    expect(resp.status).toBe(200);
    expect(resp.body).toStrictEqual({
      hello: "yes",
      nested: {
        hello: "yes",
      },
    });
  });

  it("should prune keys from the request body that are not included in the request schema, recursively.", async () => {
    const controller = new Controller();
    controller.addOperation(
      {
        name: "Test",
        method: "post",
        path: "/",
        req: Type.Object({
          hello: Type.String(),
          nested: Type.Object({
            hello: Type.String(),
          }),
        }),
      },
      async (ctx, next) => {
        ctx.body = ctx.request.body;
        await next();
      }
    );
    const resp = await testController(controller)
      .post("/")
      .send({
        hello: "yes",
        world: "no",
        nested: {
          hello: "yes",
          world: "no",
        },
      });
    // expect(resp.status).toBe(200);
    expect(resp.body).toStrictEqual({
      hello: "yes",
      nested: {
        hello: "yes",
      },
    });
  });

  it("should neither prune nor validate request bodies if no operation request schema is provided", async () => {
    const controller = new Controller();
    controller.addOperation(
      {
        name: "Test",
        method: "post",
        path: "/",
      },
      async (ctx, next) => {
        ctx.body = ctx.request.body;
        await next();
      }
    );
    const resp = await testController(controller)
      .post("/")
      .send({
        hello: "yes",
        world: "no",
        nested: {
          hello: "yes",
          world: "no",
        },
      });
    expect(resp.status).toBe(200);
    expect(resp.body).toStrictEqual({
      hello: "yes",
      world: "no",
      nested: {
        hello: "yes",
        world: "no",
      },
    });
  });
});
