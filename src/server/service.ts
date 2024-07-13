import { Options as CorsOptions } from "@koa/cors";
import Router from "@koa/router";
import Koa, { DefaultState, Middleware } from "koa";
import BodyParser from "koa-bodyparser";
import KoaQs from "koa-qs";

import { Controller } from "./controller";
import {
  convertQueryParamKeysFromKabobCase,
  isBadRequestError,
  isAPIError,
  isUnauthorizedError,
  isNotFoundError,
  isInternalServerError,
  ErrorType,
  isForbiddenError,
} from "../common";

export type Contact = {
  name: string;
  email: string;
  url: string;
};

export type License = {
  name: string;
  url: string;
};

export type Server = {
  description: string;
  url: string;
};

export interface ServiceOptions<TExtend = Record<string, never>> {
  title?: string;
  description?: string;
  tags?: string[];
  prefix?: string;
  version?: string;
  internal?: boolean;
  license?: License;
  contact?: Contact;
  servers?: Server[];
  controllers?: Controller<TExtend>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  middlewares?: Middleware<DefaultState, any>[];
  config?: Partial<ServiceConfiguration>;
  onError?: (error: Error) => void;
}

export interface ServiceConfiguration {
  /**
   * Options for the CORS middleware.
   * See Koa Cors for more information.
   */
  cors?: CorsOptions;
}

export const DEFAULT_SERVICE_CONFIGURATION: ServiceConfiguration = {
  cors: {},
} as const;

export function isService(service: any): service is Service {
  return (
    typeof service.title === "string" &&
    typeof service.description === "string" &&
    Array.isArray(service.tags) &&
    typeof service.prefix === "string"
  );
}

export class Service<TExtend = Record<string, unknown>> extends Koa<
  DefaultState,
  unknown
> {
  version: string;
  title: string;
  description: string;
  tags: string[];
  prefix: string;
  internal: boolean;
  contact: Contact;
  license: License;
  servers: Server[];
  controllers: Controller<TExtend>[];
  children: Service<TExtend>[];
  middleware: Middleware<DefaultState, unknown>[];
  router: Router<DefaultState, TExtend>;
  config: ServiceConfiguration;
  onError?: (error: Error) => void;

  constructor({
    title = "",
    description = "",
    prefix = "",
    version = "",
    servers = [{ description: "", url: "" }],
    contact = { name: "", email: "", url: "" },
    license = { name: "", url: "" },
    internal = false,
    tags = [],
    controllers = [],
    middlewares = [],
    config = DEFAULT_SERVICE_CONFIGURATION,
    onError,
  }: ServiceOptions<TExtend>) {
    super();
    this.router = new Router<DefaultState, TExtend>();
    this.version = version;
    this.children = [];
    this.title = title;
    this.description = description;
    this.tags = tags;
    this.internal = internal;
    this.contact = contact;
    this.license = license;
    this.servers = servers;
    this.prefix = prefix;
    this.controllers = controllers;
    this.middleware = middlewares as Middleware<DefaultState, unknown>[];
    this.config = { ...DEFAULT_SERVICE_CONFIGURATION, ...config };
    this.onError = onError;
  }

  register(controller: Controller<TExtend>) {
    this.controllers.push(controller);
  }

  bind(target: Router<DefaultState, TExtend> = this.router) {
    const serviceRouter = new Router<DefaultState, unknown>();

    serviceRouter.use(BodyParser());

    serviceRouter.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        if (err instanceof Error) {
          console.error("ERROR", err);
          this.onError?.(err);
          if (isAPIError(err) && isBadRequestError(err)) {
            ctx.body = {
              type: ErrorType.BadRequest,
              message: err.message,
              status: 400,
              fields: err.fields,
            };
            ctx.status = 400;
          }
          if (isAPIError(err) && isUnauthorizedError(err)) {
            ctx.body = {
              type: ErrorType.Unauthorized,
              message: err.message,
              status: 401,
            };
            ctx.status = 401;
          }
          if (isAPIError(err) && isForbiddenError(err)) {
            ctx.body = {
              type: ErrorType.Forbidden,
              message: err.message,
              status: 403,
            };
            ctx.status = 403;
          }
          if (isAPIError(err) && isNotFoundError(err)) {
            ctx.body = {
              type: ErrorType.NotFound,
              message: err.message,
              status: 404,
            };
            ctx.status = 404;
          }
          if (isAPIError(err) && isInternalServerError(err)) {
            ctx.body = {
              type: ErrorType.InternalServerError,
              message: err.message,
              status: 500,
            };
            ctx.status = 500;
          }
          if (!isAPIError(err)) {
            ctx.body = {
              type: ErrorType.InternalServerError,
              message: "An internal server error occurred.",
              status: 500,
            };
            ctx.status = 500;
          }
        } else {
          ctx.body = {
            type: ErrorType.InternalServerError,
            message: "An internal server error occurred.",
            status: 500,
          };
          ctx.status = 500;
        }
      }
    });

    // Transform null's in request bodies back to undefined
    serviceRouter.use((ctx, next) => {
      if (
        ["POST", "PUT", "PATCH"].includes(ctx.method) &&
        ctx.request.body &&
        typeof ctx.request.body === "object"
      ) {
        ctx.request.body = Object.fromEntries(
          Object.entries(ctx.request.body).map(([key, value]) => [
            key,
            value === null ? undefined : value,
          ])
        );
      }
      return next();
    });

    // Transform query parameters back from kebab case to dotted format
    // Ex. customer-name => customer.name
    serviceRouter.use((ctx, next) => {
      if (typeof ctx.query === "object") {
        ctx.query = convertQueryParamKeysFromKabobCase(ctx.query);
      }
      return next();
    });

    serviceRouter.use(...this.middleware);

    for (const controller of this.controllers) {
      controller.service = this;
      controller.bind(serviceRouter);
    }

    if (!["", "/"].includes(this.prefix)) {
      target.use(this.prefix, serviceRouter.routes());
      target.use(this.prefix, serviceRouter.allowedMethods());
    } else {
      target.use(serviceRouter.routes());
      target.use(serviceRouter.allowedMethods());
    }
  }

  init(target: Router<DefaultState, TExtend> = this.router) {
    this.bind(target);
    this.use(this.router.routes());
    this.use(this.router.allowedMethods());
  }

  start(port = 8080, addresses: string[] = ["127.0.0.1"]) {
    KoaQs(this, "extended");
    this.init();
    for (const address of addresses) {
      this.listen(port, address);
    }
  }
}
