import { generate } from "./generate";
import { T } from "../common";
import { Service, Controller } from "../server";

describe("Generate", () => {
  it("should generate an openapi schema from a Service", async () => {
    const controller = new Controller({
      prefix: "/test",
      tags: ["Test"],
    });
    controller.addOperation(
      {
        name: "Test",
        method: "get",
        path: "/",
        res: T.Object({
          hello: T.String(),
          hi: T.Date(),
        }),
      },
      async (ctx, next) => {
        ctx.body = { hello: "world", hi: new Date() };
        ctx.status = 200;
        await next();
      }
    );
    const service = new Service({
      controllers: [controller],
      title: "Test",
      description: "Description",
      version: "1.0.0",
    });

    const schema = await generate(service, { format: "json" });

    expect(JSON.parse(schema)).toEqual(
      expect.objectContaining({
        openapi: "3.0.0",
        info: expect.objectContaining({
          title: "Test",
          version: "1.0.0",
        }),
      })
    );
  });

  it("should only include operations with the internal flag when internal is set to true", async () => {
    const controller = new Controller({
      prefix: "/test",
      tags: ["Test"],
    });
    controller.addOperation(
      {
        name: "Test",
        method: "get",
        path: "/",
        res: T.Object({
          hello: T.String(),
          hi: T.Date(),
        }),
        internal: true,
      },
      async (ctx, next) => {
        ctx.body = { hello: "world", hi: new Date() };
        ctx.status = 200;
        await next();
      }
    );
    const service = new Service({
      controllers: [controller],
      title: "Test",
      description: "Description",
      version: "1.0.0",
    });

    const schemaWithInternal = await generate(service, {
      format: "json",
      internal: true,
    });

    expect(JSON.parse(schemaWithInternal)).toEqual(
      expect.objectContaining({
        paths: expect.objectContaining({
          "/test": expect.objectContaining({
            get: expect.objectContaining({
              tags: ["Test"],
            }),
          }),
        }),
      })
    );

    const schemaWithoutInternal = await generate(service, { format: "json" });

    expect(JSON.parse(schemaWithoutInternal)).toEqual(
      expect.objectContaining({
        paths: expect.not.objectContaining({
          "/test": expect.objectContaining({
            get: expect.objectContaining({
              tags: ["Test"],
            }),
          }),
        }),
      })
    );
  });

  it("should not include any routes or tags from controllers when controller.internal is true", async () => {
    const controller = new Controller({
      prefix: "/test",
      tags: ["Test"],
      internal: true,
    });
    controller.addOperation(
      {
        name: "Test",
        method: "get",
        path: "/",
        res: T.Object({
          hello: T.String(),
          hi: T.Date(),
        }),
      },
      async (ctx, next) => {
        ctx.body = { hello: "world", hi: new Date() };
        ctx.status = 200;
        await next();
      }
    );
    const service = new Service({
      controllers: [controller],
      title: "Test",
      description: "Description",
      version: "1.0.0",
    });

    const schema = JSON.parse(await generate(service, { format: "json" }));

    expect(schema.paths).toEqual({});
    expect(schema.tags).toEqual([]);
  });

  it("should not include any routes or tags from services when service.internal is true", async () => {
    const controller = new Controller({
      prefix: "/test",
      tags: ["Test"],
    });
    controller.addOperation(
      {
        name: "Test",
        method: "get",
        path: "/",
        res: T.Object({
          hello: T.String(),
          hi: T.Date(),
        }),
      },
      async (ctx, next) => {
        ctx.body = { hello: "world", hi: new Date() };
        ctx.status = 200;
        await next();
      }
    );
    const service = new Service({
      controllers: [controller],
      title: "Test",
      description: "Description",
      version: "1.0.0",
      internal: true,
    });

    const schema = JSON.parse(await generate(service, { format: "json" }));

    expect(schema.paths).toEqual({});
    expect(schema.tags).toEqual([]);
  });

  it("should generate x-tagGroups property from config.sections when provided", async () => {
    const controller = new Controller({
      prefix: "/test",
      tags: ["Test"],
    });
    controller.addOperation(
      {
        name: "Test",
        method: "get",
        path: "/",
        res: T.Object({
          hello: T.String(),
          hi: T.Date(),
        }),
      },
      async (ctx, next) => {
        ctx.body = { hello: "world", hi: new Date() };
        ctx.status = 200;
        await next();
      }
    );
    const service = new Service({
      controllers: [controller],
      title: "Test",
      description: "Description",
      version: "1.0.0",
      internal: true,
    });

    const schema = JSON.parse(
      await generate(service, {
        format: "json",
        sections: [{ title: "Test", tags: ["Test"] }],
      })
    );

    expect(schema["x-tagGroups"]).toHaveLength(1);
  });
});
