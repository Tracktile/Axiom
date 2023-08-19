import { Type, TSchema } from "@sinclair/typebox";
import Router from "@koa/router";
import { DefaultState, Middleware, Next } from "koa";

import { Service } from "./service";
import { OperationDefinition, OperationContext, Operation } from "./types";
import { isHTTPError } from "./errors";
import { compose } from "./middleware";
import { validate } from "./validation";

interface ControllerOptions {
  prefix?: string;
  tags?: string[];
  auth?: boolean;
  middleware?: Middleware<DefaultState, OperationContext>[];
}

type AnyObject = Record<string, unknown>;
type AnyObjectOrArray = object | unknown[];

function serializer(
  obj: object | null | unknown[]
): AnyObjectOrArray | unknown {
  if (obj === null) {
    return undefined;
  }

  if (obj instanceof Date) {
    return obj;
  }

  if (typeof obj !== "object" || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return (obj as Array<unknown>).map((item) =>
      serializer(item as AnyObjectOrArray)
    );
  }

  return Object.keys(obj as AnyObject).reduce((acc: AnyObject, key: string) => {
    acc[key] = serializer((obj as AnyObject)[key] as AnyObjectOrArray);
    return acc;
  }, {} as AnyObject);
}

export class Controller<TExtend = Record<string, unknown>> {
  service!: Service<TExtend>;
  prefix: string;
  tags: string[];
  auth: boolean;
  preMatchedRouteMiddleware: Middleware<DefaultState, OperationContext>[];
  router: Router<DefaultState, unknown>;
  operations: [
    OperationDefinition<TSchema, TSchema, TSchema, TSchema>,
    (
      ctx: OperationContext<
        OperationDefinition<TSchema, TSchema, TSchema, TSchema>,
        TExtend
      >,
      next: Next
    ) => Promise<void>,
  ][];

  constructor({
    prefix = "",
    middleware = [],
    tags = [],
    auth = false,
  }: ControllerOptions = {}) {
    this.router = new Router<DefaultState, unknown>();
    this.preMatchedRouteMiddleware = middleware;
    this.tags = tags;
    this.auth = auth;
    this.prefix = prefix;
    this.operations = [];
  }

  routes() {
    return this.router.routes();
  }

  allowedMethods() {
    return this.router.allowedMethods();
  }

  getOperations() {
    return this.operations;
  }

  private createOperation<
    TParams extends TSchema,
    TQuery extends TSchema,
    TReq extends TSchema,
    TRes extends TSchema,
  >(base: Operation<TParams, TQuery, TReq, TRes>) {
    return {
      ...base,
      auth: !!base.auth,
      summary: base.name,
      description: base.description ?? "No Description",
      params: base.params ?? Type.Object({}),
      query: base.query ?? Type.Object({}),
      req: base.req ?? Type.Unknown(),
      res: base.res ?? Type.Unknown(),
      middleware: base.middleware ?? [],
      tags: this.tags,
    };
  }

  private async errorHandler(
    ctx: OperationContext<
      OperationDefinition<TSchema, TSchema, TSchema, TSchema>,
      TExtend
    >,
    next: Next
  ) {
    try {
      await next();
    } catch (err) {
      if (isHTTPError(err)) {
        ctx.body = {
          message: err.message,
          errors: err.errors,
        };
        ctx.status = err.status;
        return;
      }
      if (err instanceof Error) {
        ctx.body = {
          message: err.message,
        };
        ctx.status = 500;
        return;
      }
    }
  }

  private processResponseBody = async (
    ctx: OperationContext<
      OperationDefinition<TSchema, TSchema, TSchema, TSchema>,
      TExtend
    >,
    next: Next
  ) => {
    await next();
    if (typeof ctx.body === "object") {
      ctx.body = serializer(ctx.body);
    }
  };

  register<T extends OperationDefinition<TSchema, TSchema, TSchema, TSchema>>(
    definition: T,
    path: string,
    methods: string[],
    routeMiddleware: Middleware<DefaultState, OperationContext<T, TExtend>>[],
    options?: Router.LayerOptions
  ): Router.Layer {
    const passedMiddleware = Array.isArray(routeMiddleware)
      ? routeMiddleware
      : [routeMiddleware];
    const finalMiddleware = (
      path.toString().startsWith("(")
        ? routeMiddleware
        : [
            this.errorHandler,
            ...passedMiddleware.slice(0, passedMiddleware.length - 1),
            validate(definition),
            this.processResponseBody,
            ...this.preMatchedRouteMiddleware,
            ...passedMiddleware.slice(passedMiddleware.length - 1),
          ]
    ) as Middleware<DefaultState, OperationContext<T, TExtend>>[];

    return this.router.register(
      path,
      methods,
      finalMiddleware as Middleware<DefaultState, unknown>[],
      options
    );
  }

  bind(router: Router<DefaultState, unknown> = this.router) {
    this.operations.forEach(([operation, handler]) => {
      this.register(
        operation,
        operation.path,
        [operation.method],
        [...operation.middleware, handler]
      );
    });
    if (!["", "/"].includes(this.prefix)) {
      router.use(this.prefix, this.routes());
      router.use(this.prefix, this.allowedMethods());
    } else {
      router.use(this.routes());
      router.use(this.allowedMethods());
    }
  }

  addOperation<
    TParams extends TSchema,
    TQuery extends TSchema,
    TReq extends TSchema,
    TRes extends TSchema,
  >(
    definition: Operation<TParams, TQuery, TReq, TRes>,
    ...handlers: ((
      ctx: OperationContext<
        OperationDefinition<TParams, TQuery, TReq, TRes>,
        TExtend
      >,
      next: Next
    ) => Promise<void>)[]
  ) {
    const operation = this.createOperation(definition);
    this.operations.push([
      operation,
      compose<
        OperationContext<
          OperationDefinition<TParams, TQuery, TReq, TRes>,
          TExtend
        >
      >(handlers),
    ]);
  }
}