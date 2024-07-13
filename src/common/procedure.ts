import { T, TSchema } from "../common";

export interface ProcedureOptions<
  TParams extends TSchema,
  TQuery extends TSchema,
  TResult extends TSchema,
> {
  name: string;
  resource: string;
  params: TParams;
  result: TResult;
  query?: TQuery;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
}

export class Procedure<
  TParams extends TSchema,
  TQuery extends TSchema,
  TResult extends TSchema,
> {
  name: string;
  resource: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET";
  params: TParams;
  query: TQuery;
  result: TResult;

  constructor(options: ProcedureOptions<TParams, TQuery, TResult>) {
    this.name = options.name;
    this.resource = options.resource;
    this.params = options.params;
    this.result = options.result;
    this.query = options.query ?? (T.Object({}) as unknown as TQuery);
    this.method = options.method || "GET";
  }
}

export function createProcedure<
  TParams extends TSchema,
  TQuery extends TSchema,
  TResult extends TSchema,
>(options: ProcedureOptions<TParams, TQuery, TResult>) {
  return new Procedure(options);
}
