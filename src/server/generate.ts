import "reflect-metadata";
import kebabCase from "kebab-case";
import { titleCase } from "title-case";
import { TSchema, TypeGuard } from "@sinclair/typebox";
import convert from "@openapi-contrib/json-schema-to-openapi-schema";
import * as oa from "openapi3-ts";

import { OperationDefinition } from "./types";
import { Service } from "./service";
import { CombinedService, isCombinedService } from "./combined-service";

export type Services<TContext = Record<string, never>> = {
  resource: string;
  service: Service<TContext>;
}[];

const formatPath = (path: string) => {
  const converted = path
    .split("/")
    .map((part) => {
      if (part.includes(":")) {
        return `{${part.replace(":", "")}}`;
      }
      return part;
    })
    .join("/");

  if (converted === "/") {
    return converted;
  }

  return converted.endsWith("/")
    ? converted.slice(0, converted.length - 1)
    : converted;
};

const kebab = (str: string) => kebabCase(str).substring(1);

interface GenerateOptions {
  format: "json" | "yaml";
}

const DEFAULT_GENERATE_OPTIONS: GenerateOptions = {
  format: "yaml",
};

export async function generate<TContext = Record<string, never>>(
  target: Service<TContext> | CombinedService<TContext>,
  { format = "yaml" }: GenerateOptions = DEFAULT_GENERATE_OPTIONS
) {
  const spec = oa.oas30.OpenApiBuilder.create()
    .addTitle(target.title)
    .addDescription(target.description)
    .addSecurityScheme("JWT", {
      bearerFormat: "JWT",
      type: "http",
      scheme: "bearer",
      description:
        "The JWT received by authenticating to the /auth/login endpoint.",
    })
    .addResponse("400", {
      description: "Bad Request Error",
      content: {
        "application/json": {
          schema: {
            properties: {
              status: { type: "number" },
              message: { type: "string" },
            },
            example: {
              status: 400,
              message:
                "A helpful error message indicating what was invalid about your request",
            },
          },
        },
      },
    })
    .addResponse("401", {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: {
            properties: {
              status: { type: "number" },
              message: { type: "string" },
            },
            example: {
              status: 401,
              message: "You must be authenticated to access this resource.",
            },
          },
        },
      },
    })
    .addResponse("403", {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: {
            properties: {
              status: { type: "number" },
              message: { type: "string" },
            },
            example: {
              status: 403,
              message:
                "Current user does not have permissions to access this resource.",
            },
          },
        },
      },
    })
    .addResponse("500", {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: {
            properties: {
              status: { type: "number" },
              message: { type: "string" },
            },
            example: {
              status: 500,
              message: "Something has gone horribly wrong.",
            },
          },
        },
      },
    });

  if (isCombinedService(target)) {
    target.children.forEach((service) => {
      spec.addTag({
        name: titleCase(service.title),
        description: service.description,
      });
      service.tags = [titleCase(service.title)];
    });
  }

  const operationsByPath: Record<
    string,
    OperationDefinition<TSchema, TSchema, TSchema, TSchema>[]
  > = {};

  const services = isCombinedService(target) ? target.children : [target];

  services.forEach((service) => {
    service.controllers.forEach((controller) => {
      const ops = controller.getOperations();

      ops.forEach(([op]) => {
        const path = `${
          ["", "/"].includes(service.prefix) ? "" : service.prefix
        }${controller.prefix}${op.path}`;

        if (!operationsByPath[path]) {
          operationsByPath[path] = [];
        }

        operationsByPath[path].push({
          ...op,
          tags: [...new Set([...service.tags, ...controller.tags, ...op.tags])],
        });
      });
    });
  });

  for (const path of Object.keys(operationsByPath)) {
    let pathObj: oa.oas30.PathItemObject = {};
    const operations = operationsByPath[path];

    const [first] = operations;

    pathObj.parameters = Object.keys(first.params.properties).map((key) => ({
      name: key,
      in: "path",
      required: first.params.required.includes(key),
      schema: { type: "string", format: first.params.properties[key].format },
      description: first.params.properties[key].description,
      example: first.params.properties[key].example,
      examples: first.params.properties[key].examples,
    }));

    for (const op of operations) {
      if (!TypeGuard.TObject(op.params)) {
        throw new Error(
          `Invalid parameters provided to route, must be Type.Object. ${op.name} ${op.method} ${op.path}`
        );
      }

      if (!TypeGuard.TObject(op.query)) {
        throw new Error(
          `Invalid query provided to route, must be Type.Object. ${op.name} ${op.method} ${op.path}`
        );
      }

      pathObj = {
        ...pathObj,
        [op.method]: {
          operationId: kebab(op.name),
          summary: op.summary ?? "No Summary",
          description: !!op.description ? op.description : "No description",
          tags: op.tags.map(titleCase),
          ...(["post", "put"].includes(op.method)
            ? {
                requestBody: {
                  content: {
                    "application/json": { schema: await convert(op.req) },
                  },
                },
              }
            : {}),
          parameters: Object.keys(op.query.properties).map((prop) => ({
            name: prop,
            schema: {
              type: "string",
              format: op.query.properties[prop].format,
            },
            in: "query",
            description: op.query.properties[prop].description,
          })),
          security: op.auth ? [{ JWT: [] }] : [],
          responses: {
            200: {
              description: op.res.description ?? "Success",
              content: {
                "application/json": {
                  schema: await convert(op.res),
                },
              },
            },
            400: { $ref: "#/components/responses/400" },
            401: { $ref: "#/components/responses/401" },
            403: { $ref: "#/components/responses/403" },
            500: { $ref: "#/components/responses/500" },
          } as oa.oas30.ResponsesObject,
        } as oa.oas30.OperationObject,
      };
    }

    spec.addPath(formatPath(path), pathObj);
  }

  if (format === "yaml") {
    return spec.getSpecAsYaml();
  }
  return spec.getSpecAsJson();
}
