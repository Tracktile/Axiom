import "reflect-metadata";
import kebabCase from "kebab-case";
import { debug } from "debug";
import { TSchema, TypeGuard } from "@sinclair/typebox";
import convert from "@openapi-contrib/json-schema-to-openapi-schema";
import * as oa from "openapi3-ts";

import { OperationDefinition } from "../server/types";
import { Service } from "../server/service";
import { CombinedService, isCombinedService } from "../server/combined-service";
import { withDatesAsDateTimeStrings } from "../common/utils";

const log = debug("axiom:cli:generate");

export type Services<TContext = Record<string, never>> = {
  resource: string;
  service: Service<TContext>;
}[];

async function convertToOpenAPI<TSchema>(schema: TSchema) {
  const converted = convert(schema as object);
  return converted;
}

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

const kebab = (str: string) => {
  const noSpaces = str.replace(/\s/g, "");
  return kebabCase(noSpaces).substring(1).toLocaleLowerCase();
};

interface GenerateOptions {
  format: "json" | "yaml";
  internal?: boolean;
}

const DEFAULT_GENERATE_OPTIONS: GenerateOptions = {
  format: "yaml",
};

export async function generate<TContext = Record<string, never>>(
  target: Service<TContext> | CombinedService<TContext>,
  {
    format = "yaml",
    internal = false,
  }: GenerateOptions = DEFAULT_GENERATE_OPTIONS
) {
  log("Generating OpenAPI spec from service", target);
  const spec = oa.oas30.OpenApiBuilder.create()
    .addTitle(target.title)
    .addDescription(target.description)
    .addVersion(target.version)
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

  if (target.license) {
    spec.addLicense(target.license);
  }

  for (const server of target.servers) {
    spec.addServer(server);
  }

  if (isCombinedService(target)) {
    log("Input is a combined service - adding tags for each service");
    target.children.forEach((service) => {
      log(`Adding for service ${service.title}`);
      spec.addTag({
        name: service.title,
        description: service.description,
      });
      service.tags = [service.title];
    });
  }

  const operationsByPath: Record<
    string,
    OperationDefinition<TSchema, TSchema, TSchema, TSchema>[]
  > = {};

  const services = isCombinedService(target) ? target.children : [target];

  log(`Found ${services.length} services`);

  services.forEach((service) => {
    log(`Adding controllers for service ${service.title}`);
    service.controllers.forEach((controller) => {
      const ops = controller.getOperations();
      log(`Found ${ops.length} operations for controller`);
      ops.forEach(([op]) => {
        log(
          `Operation: ${op.method.toUpperCase()} ${controller.prefix}${
            op.path
          }: ${op.name}`
        );
        const path = `${
          ["", "/"].includes(service.prefix) ? "" : service.prefix
        }${controller.prefix}${op.path}`;

        if (!Array.isArray(operationsByPath[path])) {
          operationsByPath[path] = [];
        }

        operationsByPath[path].push({
          ...op,
          tags: [...new Set([...service.tags, ...controller.tags, ...op.tags])],
        });
      });
    });
  });

  log("Iterating over operations by path to generate path parameters");

  for (const path of Object.keys(operationsByPath)) {
    log(`Generating path parameters for path ${path}`);
    let pathObj: oa.oas30.PathItemObject = {};
    const operations = operationsByPath[path].filter((op) => {
      log({ internal, opIsInternal: op.internal });
      return !op.internal || !internal;
    });
    log(`Found ${operations.length} operations for path ${path}`);

    const [first] = operations;
    if (first) {
      log(`First operation: ${first.name} ${first.method} ${first.path}`);

      pathObj.parameters = Object.keys(first.params.properties).map((key) => ({
        name: key,
        in: "path",
        required: first.params.required.includes(key),
        schema: { type: "string", format: first.params.properties[key].format },
        description: first.params.properties[key].description,
        example: first.params.properties[key].example,
        examples: first.params.properties[key].examples,
      }));
    }

    log(`Path parameters: ${JSON.stringify(pathObj.parameters)}`);

    for (const op of operations) {
      log(`Generating operation ${op.name} ${op.method} ${op.path}`);
      if (!TypeGuard.TObject(op.params)) {
        throw new Error(
          `Invalid parameters provided to route, must be T.Object. ${op.name} ${op.method} ${op.path}`
        );
      }

      if (!TypeGuard.TObject(op.query)) {
        throw new Error(
          `Invalid query provided to route, must be T.Object. ${op.name} ${op.method} ${op.path}`
        );
      }

      log(`req`, JSON.stringify(op.req, null, ""));
      log(`res`, JSON.stringify(op.res, null, ""));

      pathObj = {
        ...pathObj,
        [op.method]: {
          operationId: kebab(op.name),
          summary: op.summary ?? "No Summary",
          description: !!op.description ? op.description : "No description",
          tags: op.tags,
          ...(["post", "put"].includes(op.method)
            ? {
                requestBody: {
                  content: {
                    "application/json": {
                      schema: await convertToOpenAPI(
                        withDatesAsDateTimeStrings(op.req)
                      ),
                    },
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
                  schema: await convertToOpenAPI(
                    withDatesAsDateTimeStrings(op.res)
                  ),
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

    log(`Adding path ${path}`, pathObj);

    spec.addPath(formatPath(path), pathObj);
  }

  if (format === "yaml") {
    return spec.getSpecAsYaml();
  }
  return spec.getSpecAsJson();
}
