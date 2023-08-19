import { validate as isUUID } from "uuid";
import { TSchema, TypeGuard } from "@sinclair/typebox";
import { ValueError, TypeCompiler } from "@sinclair/typebox/compiler";
import { Value } from "@sinclair/typebox/value";
import { TypeSystem } from "@sinclair/typebox/system";
import { DefaultState, Middleware, Next } from "koa";

import { BadRequestError } from "./errors";
import { OperationDefinition, OperationContext } from "./types";

TypeSystem.Format(
  "palindrome",
  (value) => value === value.split("").reverse().join("")
);
TypeSystem.Format("email", (value) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
);
TypeSystem.Format("uuid", (value) => isUUID(value));
TypeSystem.Format("hexcolor", (value) =>
  /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(value)
);
TypeSystem.Format("date-time", (value) => !isNaN(Date.parse(value)));

function stripAdditionalProperties(schema: TSchema, source: unknown): unknown {
  if (TypeGuard.TArray(schema) && Array.isArray(source)) {
    return source.map((item) => stripAdditionalProperties(schema.items, item));
  }
  if (
    TypeGuard.TObject(schema) &&
    source !== null &&
    typeof source === "object"
  ) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(source)) {
      if (key in schema.properties) {
        result[key] = stripAdditionalProperties(
          schema.properties[key],
          value as Record<string, unknown>
        );
      }
    }
    return result;
  }
  return source;
}

export function validate<
  RouteContext extends OperationDefinition<TSchema, TSchema, TSchema, TSchema>,
  TExtend = Record<string, unknown>,
>(
  context: Partial<RouteContext>
): Middleware<DefaultState, OperationContext<RouteContext, TExtend>> {
  return async (ctx: OperationContext<RouteContext, TExtend>, next: Next) => {
    let errors: ValueError[] = [];
    if (context.query) {
      errors = [...errors, ...Value.Errors(context.query, ctx.query)];
    }
    if (context.params) {
      errors = [...errors, ...Value.Errors(context.params, ctx.params)];
    }

    if (
      context.req &&
      !TypeGuard.TUnknown(context.req) &&
      typeof ctx.request.body !== "undefined"
    ) {
      const striped = stripAdditionalProperties(context.req, ctx.request.body);
      const schema = context.req;
      const check = TypeCompiler.Compile(schema);
      const casted = Value.Convert(schema, striped);
      const checked = check.Check(casted);

      if (checked) {
        ctx.request.body = casted;
      } else {
        errors = [...errors, ...check.Errors(ctx.request.body)];
      }
    }

    if (errors.length > 0) {
      throw new BadRequestError("Invalid Request", errors);
    }

    await next();

    if (
      context.res &&
      !TypeGuard.TUnknown(context.res) &&
      ctx.status < 300 &&
      typeof ctx.body !== "undefined"
    ) {
      const striped = stripAdditionalProperties(context.res, ctx.body);
      const schema = context.res;
      const check = TypeCompiler.Compile(schema);
      const convert = Value.Convert(schema, striped);
      const checked = check.Check(convert);

      if (checked) {
        ctx.body = convert;
      } else {
        errors = [...errors, ...check.Errors(ctx.body)];
      }
    }

    if (errors.length > 0) {
      throw new BadRequestError("Invalid Response", errors);
    }
  };
}
