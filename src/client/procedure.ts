import { TSchema, Static } from "@sinclair/typebox";
import { MutableRefObject, createRef } from "react";
import {
  QueryClient,
  UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";

import { buildResourcePath, request } from "./request";
import { Procedure } from "common/procedure";

export interface ReactProcedureOptions<
  TParams extends TSchema,
  TResult extends TSchema,
> {
  procedure: Procedure<TParams, TResult>;
}

interface ProcedureBindOptions {
  client: QueryClient;
  baseUrl: string;
  token: MutableRefObject<string | null>;
}

// TParams extends TSchema, TResult extends TSchema
export class ReactProcedure<TProcedure extends Procedure<any, any>> {
  baseUrl: string = "";
  token: MutableRefObject<string | null>;
  client?: QueryClient;
  procedure: Procedure<TProcedure["params"], TProcedure["result"]>;

  constructor(
    options: ReactProcedureOptions<TProcedure["params"], TProcedure["result"]>
  ) {
    this.procedure = options.procedure;
    this.token = createRef<string | null>();
  }

  bind({ client, baseUrl, token }: ProcedureBindOptions) {
    this.baseUrl = baseUrl;
    this.client = client;
    this.token = token;
    return this;
  }

  run(
    options: UseMutationOptions<
      Static<TProcedure["result"]>,
      Error,
      Static<TProcedure["params"]>
    > = {}
  ) {
    const mutation = useMutation({
      mutationKey: [this.procedure.name],
      mutationFn: async (
        params: Static<TProcedure["params"]>
      ): Promise<Static<TProcedure["result"]>> => {
        const [resp] = await request<Static<TProcedure["result"]>>(
          buildResourcePath(this.baseUrl, this.procedure.resource),
          {
            method: this.procedure.method,
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
