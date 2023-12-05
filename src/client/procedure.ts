import { MutableRefObject, createRef } from "react";
import {
  QueryClient,
  UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";

import { Static, TSchema, convertQueryParamKeysToKabobCase } from "../common";
import { buildResourcePath, paramsForQuery, request } from "./request";
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
        const url = buildResourcePath(
          this.baseUrl,
          this.procedure.resource,
          params
        );
        const paramsForQ = paramsForQuery(url, params);
        const query = convertQueryParamKeysToKabobCase(paramsForQ);
        const [resp] = await request<Static<TProcedure["result"]>>(url, {
          method: this.procedure.method,
          body: params,
          token: this.token.current,
          query,
        });
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
