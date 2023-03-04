import { stringify } from "qs";
import { Static, TSchema } from "@sinclair/typebox";

import { ModelId } from "./model";
import { MutableRefObject, Ref } from "react";

export type QueryParameters = Record<string, string | number | boolean>;

export interface APIRequestParams<T> {
  method?: string;
  headers?: Record<string, string>;
  query?: QueryParameters;
  body?: T;
  token?: string | null;
}

export async function request<TRequestBody, TResponseBody = TRequestBody>(
  url: string,
  {
    method = "get",
    headers = {},
    query = {},
    body,
    token,
  }: APIRequestParams<TRequestBody> = {}
): Promise<TResponseBody> {
  const queryString = stringify(query);
  const uri = `${url}${!!queryString ? `?${queryString}` : ""}`;

  const resp = await fetch(uri, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(!!token ? { Authorization: `Bearer ${token}` } : {}),
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

export type RequestCreatorOptions = {
  resourcePath: string;
  token: MutableRefObject<string | null>;
};

export function createSearchRequestFn<T extends TSchema>({
  resourcePath,
  token,
}: RequestCreatorOptions) {
  return async function search(params?: QueryParameters) {
    return request<Static<T>[]>(resourcePath, {
      method: "get",
      query: params,
      token: token.current,
    });
  };
}

export function createGetRequestFn<T extends TSchema>({
  resourcePath,
  token,
}: RequestCreatorOptions) {
  return async function get(id: ModelId) {
    return request<Static<T>>(`${resourcePath}/${id}`, {
      method: "get",
      token: token.current,
    });
  };
}

export function createCreateRequestFn<T extends TSchema>({
  resourcePath,
  token,
}: RequestCreatorOptions) {
  return async function create(body: Static<T>) {
    return request<Static<T>>(resourcePath, {
      method: "post",
      body,
      token: token.current,
    });
  };
}

export function createUpdateRequestFn<T extends TSchema>({
  resourcePath,
  idKey = "id",
  token,
}: RequestCreatorOptions & { idKey: keyof Static<T> | "id" }) {
  return async function update(body: Static<T> & { id: typeof idKey }) {
    return request<Static<T>>(`${resourcePath}/${body[idKey]}`, {
      method: "put",
      body,
      token: token.current,
    });
  };
}

export function createRemoveRequestFn<T extends TSchema>({
  resourcePath,
  token,
}: RequestCreatorOptions) {
  return async function remove(body: Static<T>) {
    return request<Static<T>, void>(resourcePath, {
      method: "delete",
      body,
      token: token.current,
    });
  };
}
