import { buildResourcePath, request } from "./request";

import { QueryClient, useQuery } from "@tanstack/react-query";
import { createRef, MutableRefObject } from "react";
import { Resource, Static, TSchema } from "../common";

interface ReactResourceOptions<TResp extends TSchema, TParams extends TSchema> {
  resource: Resource<TResp, TParams>;
}

interface ReactResourceBindOptions {
  baseUrl: string;
  client: QueryClient;
  token: MutableRefObject<string | null>;
}

interface ResourceGetOptions<
  TResp extends TSchema,
  TParams extends TSchema,
  TTransformed = Static<TResp>,
> {
  params?: Static<TParams>;
  select?: (data: Static<TResp>) => TTransformed;
}

export class ReactResource<TResource extends Resource<any, any>> {
  resource: Resource<TResource["schema"], TResource["params"]>;
  baseUrl?: string;
  token?: MutableRefObject<string | null>;
  client?: QueryClient;

  constructor(
    options: ReactResourceOptions<TResource["schema"], TResource["params"]>
  ) {
    this.resource = options.resource;
    this.token = createRef<string | null>();
    this.baseUrl = "";
  }

  bind({ client, baseUrl, token }: ReactResourceBindOptions) {
    this.baseUrl = baseUrl;
    this.client = client;
    this.token = token;
    return this;
  }

  get(
    params: Static<TResource["params"]>,
    options?: ResourceGetOptions<TResource["schema"], TResource["params"]>
  ) {
    return useQuery({
      queryKey: [this.resource.resource, params],
      queryFn: async () => {
        const [data] = await request<TResource["schema"]>(
          buildResourcePath(this.baseUrl ?? "", this.resource.resource, params),
          {
            token: this.token?.current,
          }
        );
        return data;
      },
      refetchOnMount: true,
      retryOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      ...options,
    });
  }
}
