import Koa, { DefaultState, Middleware } from "koa";
import { Options as CorsOptions } from "@koa/cors";
import BodyParser from "koa-bodyparser";
import Router from "@koa/router";
import KoaQs from "koa-qs";

import { Controller } from "./controller";
import { convertQueryParamKeysFromKabobCase } from "../common";
import { isHTTPError } from "./errors";

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
  internal?: boolean;
  title?: string;
  description?: string;
  tags?: string[];
  prefix?: string;
  version?: string;
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
  onError: (error: Error) => void;

  constructor({
    title = "",
    description = "",
    prefix = "",
    version = "",
    servers = [{ description: "", url: "" }],
    contact = { name: "", email: "", url: "" },
    license = { name: "", url: "" },
    tags = [],
    controllers = [],
    middlewares = [],
    internal = false,
    config = DEFAULT_SERVICE_CONFIGURATION,
    onError = console.error,
  }: ServiceOptions<TExtend>) {
    super();
    this.router = new Router<DefaultState, TExtend>();
    this.version = version;
    this.children = [];
    this.title = title;
    this.description = description;
    this.tags = tags;
    this.contact = contact;
    this.license = license;
    this.servers = servers;
    this.prefix = prefix;
    this.internal = internal;
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
          if (isHTTPError(err)) {
            ctx.body = {
              message: err.message,
              errors: err.errors,
            };
            ctx.status = err.status;
          } else {
            ctx.body = {
              message: err.message,
            };
            ctx.status = 500;
          }
          this.onError(err);
          return;
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
