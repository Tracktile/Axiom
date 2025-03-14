import { TSchema, TypeGuard } from "@sinclair/typebox";
import { ValueError } from "@sinclair/typebox/compiler";
import { Value } from "@sinclair/typebox/value";
import { DefaultState, Middleware, Next } from "koa";

import { BadRequestError, TypeSystem, noAdditionalProperties } from "../common";
import { OperationContext, OperationDefinition } from "./types";

type FormatValidator = (value: string) => boolean;

const formats: Record<string, FormatValidator> = {
  palindrome: (v) => /^[a-zA-Z0-9]*$/.test(v),
  email: (v) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v),
  uuid: (v) => /^[a-f\d]{8}(-[a-f\d]{4}){4}[a-f\d]{8}$/i.test(v),
  hexcolor: (v) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(v),
  "date-time": (v) => !isNaN(Date.parse(v)),
};

Object.entries(formats).forEach(([name, validatorFn]) => {
  try {
    TypeSystem.Format(name, (value) => validatorFn(value));
  } catch (err) {
    // NOOP
  }
});

function parseValueErrors(errors: ValueError[]): Record<string, string> {
  return errors.reduce(
    (acc, { path, message }) => ({
      ...acc,
      [(path.startsWith("/") ? path.slice(1, path.length) : path).replace(
        "/",
        "."
      )]: message,
    }),
    {} as Record<string, string>
  );
}

export function validate<
  RouteContext extends OperationDefinition<TSchema, TSchema, TSchema, TSchema>,
  TExtend = Record<string, unknown>,
>(
  context: Partial<RouteContext>
): Middleware<DefaultState, OperationContext<RouteContext, TExtend>> {
  return async (ctx: OperationContext<RouteContext, TExtend>, next: Next) => {
    let errors: ValueError[] = [];
    // if (context.query) {
    //   const striped = noAdditionalProperties(context.query, ctx.query);
    //   ctx.query = striped;
    //   errors = [
    //     ...errors,
    //     ...Value.Errors(context.query, trueFalseStringsToBoolean(striped)),
    //   ];
    // }
    if (context.params) {
      errors = [...errors, ...Value.Errors(context.params, ctx.params)];
    }

    if (
      context.req &&
      !TypeGuard.IsUnknown(context.req) &&
      typeof ctx.request.body !== "undefined"
    ) {
      const striped = noAdditionalProperties(context.req, ctx.request.body);
      ctx.request.body = striped;
      const schema = context.req;
      errors = [...errors, ...Value.Errors(schema, ctx.request.body)];
    }

    if (errors.length > 0) {
      throw new BadRequestError("Invalid Request", parseValueErrors(errors));
    }

    await next();

    if (
      context.res &&
      !TypeGuard.IsUnknown(context.res) &&
      ctx.status < 300 &&
      typeof ctx.body !== "undefined"
    ) {
      const striped = noAdditionalProperties(context.res, ctx.body);
      ctx.body = striped;
      const schema = context.res;
      errors = [...errors, ...Value.Errors(schema, ctx.body)];
    }

    if (errors.length > 0) {
      throw new BadRequestError("Invalid Response", parseValueErrors(errors));
    }
  };
}
