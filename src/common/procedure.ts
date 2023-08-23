import { TSchema } from "../common";

export interface ProcedureOptions<
  TParams extends TSchema,
  TResult extends TSchema,
> {
  name: string;
  resource: string;
  params: TParams;
  result: TResult;
}

export class Procedure<TParams extends TSchema, TResult extends TSchema> {
  name: string;
  resource: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET";
  params: TParams;
  result: TResult;

  constructor(options: ProcedureOptions<TParams, TResult>) {
    this.name = options.name;
    this.resource = options.resource;
    this.params = options.params;
    this.result = options.result;
  }
}

export function createProcedure<
  TParams extends TSchema,
  TResult extends TSchema,
>(options: ProcedureOptions<TParams, TResult>) {
  return new Procedure(options);
}
