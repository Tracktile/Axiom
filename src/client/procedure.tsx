import { TSchema, Static } from "@sinclair/typebox";
import {
  QueryClient,
  UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";

import { buildResourcePath, request } from "./request";
import { MutableRefObject, createRef } from "react";

interface IProcedure<TParams extends TSchema, TResult extends TSchema> {
  name: string;
  params: TParams;
  result: TResult;
}

export interface ProcedureOptions<
  TParams extends TSchema,
  TResult extends TSchema,
> {
  name: string;
  method: "get" | "post" | "put" | "delete" | "patch" | "head" | "options";
  resource: string;
  params: TParams;
  result: TResult;
}

interface ProcedureBindOptions {
  client: QueryClient;
  baseUrl: string;
  token: MutableRefObject<string | null>;
}

export class Procedure<TParams extends TSchema, TResult extends TSchema>
  implements IProcedure<TParams, TResult>
{
  name: string;
  method: "get" | "post" | "put" | "delete" | "patch" | "head" | "options";
  baseUrl: string = "";
  token: MutableRefObject<string | null>;
  resource: string;
  params: TParams;
  result: TResult;
  client?: QueryClient;

  constructor(options: ProcedureOptions<TParams, TResult>) {
    this.name = options.name;
    this.method = options.method;
    this.resource = options.resource;
    this.params = options.params;
    this.result = options.result;
    this.token = createRef<string | null>();
  }

  bind({ client, baseUrl, token }: ProcedureBindOptions) {
    this.baseUrl = baseUrl;
    this.client = client;
    this.token = token;
    return this;
  }

  run(
    options: UseMutationOptions<Static<TResult>, Error, Static<TParams>> = {}
  ) {
    const mutation = useMutation({
      mutationKey: [this.name],
      mutationFn: async (params: Static<TParams>): Promise<Static<TResult>> => {
        const [resp] = await request<Static<TResult>>(
          buildResourcePath(this.baseUrl, this.resource),
          {
            method: this.method,
            body: params,
          }
        );
        return resp;
      },
      ...options,
    });
    return {
      ...mutation,
      mutate: mutation.mutate,
      run: mutation.mutateAsync,
    };
  }
}

export function createProcedure<
  TParams extends TSchema,
  TResult extends TSchema,
>(options: ProcedureOptions<TParams, TResult>) {
  return new Procedure(options);
}
