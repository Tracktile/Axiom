import {
  Middleware,
  DefaultState,
  DefaultContext,
  ParameterizedContext,
} from "koa";

import { T, Static, TSchema } from "../common";

export const Nullable = <T extends TSchema>(schema: T) =>
  T.Union([schema, T.Null()]);

export type OperationContext<
  T extends OperationDefinition<
    TSchema,
    TSchema,
    TSchema,
    TSchema
  > = OperationDefinition<TSchema, TSchema, TSchema, TSchema>,
  TExtend = Record<string, unknown>,
> = ParameterizedContext<DefaultState, DefaultContext, Static<T["res"]>> &
  TExtend & {
    body: Static<T["res"]>;
    query: Static<T["query"]>;
    params: Static<T["params"]>;
    request: ParameterizedContext["request"] & { body: Static<T["req"]> };
  };

export type OperationDefinition<
  TParams extends TSchema,
  TQuery extends TSchema,
  TReq extends TSchema,
  TRes extends TSchema,
> = {
  name: string;
  method: "get" | "post" | "put" | "patch" | "delete";
  summary: string;
  description: string;
  path: string;
  params: TParams;
  auth: boolean;
  query: TQuery;
  req: TReq;
  res: TRes;
  middleware: Middleware<DefaultState, OperationContext>[];
  tags: string[];
};

export type Operation<
  TParams extends TSchema,
  TQuery extends TSchema,
  TReq extends TSchema,
  TRes extends TSchema,
> = Partial<OperationDefinition<TParams, TQuery, TReq, TRes>> &
  Pick<
    OperationDefinition<TParams, TQuery, TReq, TRes>,
    "name" | "method" | "path"
  >;
