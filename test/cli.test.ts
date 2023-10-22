import { generate } from "../src/cli/generate";
import { T } from "../src/common";
import { Service, Controller, combineServices } from "../src/server";

describe("CLI", () => {
  describe("Generate", () => {
    it("should generate openapi docs for a single service", () => {
      const controller = new Controller({
        tags: ["Example"],
        prefix: "/example",
      });

      controller.addOperation({
        name: "Get Example",
        path: "/id",
        method: "get",
        params: T.Object({
          id: T.String({ format: "uuid" }),
        }),
      });

      const service = new Service({
        title: "Example Service",
        description: "An incredible example service that does awesome things.",
        controllers: [controller],
        contact: {
          name: "Example",
          email: "example@contact.com",
          url: "https://example.com",
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
        servers: [
          {
            url: "https://example.com/api",
            description: "Production Server",
          },
        ],
      });

      const yaml = generate(service, { format: "yaml" });

      expect(yaml).toBeDefined();
    });

    it("it should generate openapi docs for a combined services", () => {
      const controller = new Controller({
        tags: ["Example"],
        prefix: "/example",
      });
      controller.addOperation({
        name: "Get Example",
        path: "/id",
        method: "get",
        params: T.Object({
          id: T.String({ format: "uuid" }),
        }),
      });

      const serviceA = new Service({
        title: "Example Service",
        description: "An incredible example service that does awesome things.",
        controllers: [controller],
        contact: {
          name: "Example",
          email: "",
          url: "",
        },
      });

      const serviceB = new Service({
        title: "Example Service",
        description: "An incredible example service that does awesome things.",
        contact: {
          name: "Example",
          email: "",
          url: "",
        },
      });

      const combined = combineServices([serviceA, serviceB]);

      const yaml = generate(combined, { format: "yaml" });

      expect(yaml).toBeDefined();
    });
  });
});
