import { stringify } from "qs";
import { Static, TSchema } from "@sinclair/typebox";

import { ModelId } from "./model";

const token = "";

export interface ApiPaginationParams {
  limit?: number;
  offset?: number;
}

export interface APIRequestParams<T> {
  method?: string;
  headers?: Record<string, string>;
  query?: ApiPaginationParams;
  body?: T;
}

export async function request<TRequestBody, TResponseBody = TRequestBody>(
  url: string,
  {
    method = "get",
    headers = {},
    query = {},
    body,
  }: APIRequestParams<TRequestBody> = {}
): Promise<TResponseBody> {
  const queryString = stringify({
    ...query,
    offset: query.offset ?? 0,
    limit: query.limit ?? 100,
  });
  const uri = `${url}${!!queryString ? `?${queryString}` : ""}`;

  const resp = await fetch(uri, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: ["post", "put"].includes(method.toLowerCase())
      ? JSON.stringify(body)
      : undefined,
  });

  if (!resp.ok) {
    const { message } = await resp.json();
    throw new Error(message);
  }

  const respBody = await resp.json();
  return respBody as TResponseBody;
}

export function createSearchRequestFn<T extends TSchema>(resourcePath: string) {
  return (params?: ApiPaginationParams) => {
    return request<Static<T>[]>(resourcePath, { method: "get", query: params });
  };
}

export function createGetRequestFn<T extends TSchema>(resourcePath: string) {
  return function get(id: ModelId) {
    return request<Static<T>>(`${resourcePath}/${id}`, { method: "get" });
  };
}

export function createCreateRequestFn<T extends TSchema>(resourcePath: string) {
  return async (body: Static<T>) => {
    return request<Static<T>>(resourcePath, { method: "post", body });
  };
}

export function createUpdateRequestFn<T extends TSchema>(
  resourcePath: string,
  idKey: keyof Static<T> | "id" = "id"
) {
  return async (body: Static<T> & { id: typeof idKey }) => {
    return request<Static<T>>(`${resourcePath}/${body[idKey]}`, {
      method: "put",
      body,
    });
  };
}

export function createRemoveRequestFn<T extends TSchema>(path: string) {
  return async (body: Static<T>) => {
    return request<Static<T>, void>(path, { method: "delete", body });
  };
}
