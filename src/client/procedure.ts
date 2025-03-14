import {
  QueryClient,
  UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";
import { MutableRefObject, createRef } from "react";

import { Procedure } from "../common/procedure";
import { buildResourcePath, paramsForQuery, request } from "./request";
import { Static, TSchema, convertQueryParamKeysToKabobCase } from "../common";

export interface ReactProcedureOptions<
  TParams extends TSchema,
  TQuery extends TSchema,
  TResult extends TSchema,
> {
  procedure: Procedure<TParams, TQuery, TResult>;
}

interface ProcedureBindOptions {
  client: QueryClient;
  baseUrl: string;
  token: MutableRefObject<string | null>;
}

export class ReactProcedure<TProcedure extends Procedure<any, any, any>> {
  baseUrl: string;
  token: MutableRefObject<string | null>;
  client?: QueryClient;
  procedure: Procedure<
    TProcedure["params"],
    TProcedure["query"],
    TProcedure["result"]
  >;

  constructor(
    options: ReactProcedureOptions<
      TProcedure["params"],
      TProcedure["query"],
      TProcedure["result"]
    >
  ) {
    this.procedure = options.procedure;
    this.token = createRef<string | null>();
    this.baseUrl = "";
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const mutation = useMutation({
      mutationKey: [this.procedure.name],
      mutationFn: async (
        params: Static<TProcedure["params"]> & Static<TProcedure["query"]>
      ): Promise<Static<TProcedure["result"]>> => {
        const url = buildResourcePath(
          this.baseUrl,
          this.procedure.resource,
          params
        );
        const paramsForQueryString = paramsForQuery(
          this.procedure.resource,
          this.procedure.method.toLowerCase() === "get" ? params : {}
        );
        const [resp] = await request<Static<TProcedure["result"]>>(url, {
          method: this.procedure.method,
          body:
            this.procedure.method.toLowerCase() === "get" ? undefined : params,
          token: this.token.current,
          query: convertQueryParamKeysToKabobCase(paramsForQueryString),
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
