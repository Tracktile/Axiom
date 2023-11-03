import { stringify } from "qs";
import { MutableRefObject } from "react";
import debug from "debug";

import { Static, TSchema, convertQueryParamKeysToKabobCase } from "../common";
import { PaginationParams } from "./model";

const log = debug("axiom:request");

export type QueryParameters = Record<
  string,
  string | number | boolean | undefined
>;

interface APIRequestParams<T> {
  method?: string;
  headers?: Record<string, string>;
  query?: QueryParameters;
  body?: T;
  token?: string | null;
}

export function buildResourcePath<
  TParams extends Record<string, string | number>,
>(baseUrl: string, resource: string, params: TParams = {} as TParams) {
  const cleanBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.substr(0, baseUrl.length - 1)
    : baseUrl;
  const cleanResource = resource.startsWith("/")
    ? resource.substr(1)
    : resource;
  const url = `${cleanBaseUrl}/${cleanResource}`;
  const paramsForResource = Object.keys(params).filter((key) =>
    url.includes(`:${key}`)
  );
  const paramsForQuery = Object.keys(params).filter(
    (key) => !paramsForResource.includes(key)
  );
  const urlWithParams = Object.entries(paramsForResource).reduce(
    (acc, [key, val]) => {
      return acc.replace(`:${key}`, val.toString());
    },
    url
  );
  const urlWithQuery = Object.entries(paramsForQuery).reduce(
    (acc, [key, val]) => {
      return `${acc}${acc.includes("?") ? "&" : "?"}${key}=${val}`;
    },
    urlWithParams
  );
  return urlWithQuery;
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
): Promise<[TResponseBody, PaginationParams & { total: number }]> {
  const cleanedQuery = Object.entries(query).reduce((acc, [key, val]) => {
    if (!val) {
      return acc;
    }
    return { ...acc, [key]: val };
  }, {});
  const queryString = stringify(cleanedQuery);
  const uri = `${url}${!!queryString ? `?${queryString}` : ""}`;

  const requestHeaders = {
    "Content-Type": "application/json",
    ...(!!token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  log(`${method} ${uri}`, { body, headers: requestHeaders, token });
  const resp = await fetch(uri, {
    method,
    headers: requestHeaders,
    body: ["post", "put"].includes(method.toLowerCase())
      ? JSON.stringify(body)
      : undefined,
  });

  if (!resp.ok) {
    const { message } = await resp.json();
    throw new Error(message);
  }

  log(`${method} ${uri} - ${resp.status} ${resp.statusText}`, resp.text);

  const responseHeaders: Record<string, string> = {};
  for (const pair of resp.headers.entries()) {
    const [name, value] = pair;
    responseHeaders[name.toLowerCase()] = value;
  }

  const [offset, limit, total] = [
    responseHeaders["X-Pagination-Offset".toLowerCase()],
    responseHeaders["X-Pagination-Limit".toLowerCase()],
    responseHeaders["X-Pagination-Total".toLowerCase()],
  ];

  const respBody = (await resp.json()) as TResponseBody;

  return [
    respBody,
    {
      offset: parseInt(offset, 10),
      limit: parseInt(limit, 10),
      total: parseInt(total, 10),
    },
  ];
}

type RequestCreatorOptions = {
  resourcePath: string;
  token: MutableRefObject<string | null>;
  headers?: Record<string, string>;
};

export function createSearchRequestFn<T extends TSchema>({
  resourcePath,
  token,
  headers,
  ...options
}: RequestCreatorOptions) {
  return async function search({
    offset = 0,
    limit = 999,
    orderBy,
    ...query
  }: PaginationParams & QueryParameters = {}) {
    const [results, { total }] = await request<Static<T>[]>(resourcePath, {
      method: "get",
      query: convertQueryParamKeysToKabobCase(query),
      token: token.current,
      headers: {
        "X-Pagination-Offset": offset.toString(),
        "X-Pagination-Limit": limit.toString(),
        ...(!!orderBy ? { "X-Pagination-OrderBy": orderBy } : {}),
        ...headers,
      },
      ...options,
    });
    return { results, total, offset, limit, orderBy };
  };
}

export function createCallRequestFn<T extends TSchema>({
  resourcePath,
  token,
  ...options
}: RequestCreatorOptions) {
  return async function call(params: QueryParameters) {
    const [resp] = await request<unknown, Static<T>>(resourcePath, {
      token: token.current,
      query: params,
      ...options,
    });
    return resp;
  };
}

export function createGetRequestFn<T extends TSchema>({
  resourcePath,
  token,
  ...options
}: RequestCreatorOptions) {
  return async function get(id: string | number) {
    const [resp] = await request<Static<T>>(`${resourcePath}/${id}`, {
      method: "get",
      token: token.current,
      ...options,
    });
    return resp;
  };
}

export function createCreateRequestFn<T extends TSchema>({
  resourcePath,
  token,
  ...options
}: RequestCreatorOptions) {
  return async function create(body: Static<T>) {
    const [resp] = await request<Static<T>>(resourcePath, {
      method: "post",
      body,
      token: token.current,
      ...options,
    });
    return resp;
  };
}

export function createUpdateRequestFn<T extends TSchema>({
  resourcePath,
  token,
  ...options
}: RequestCreatorOptions) {
  return async function update(id: string | number, body: Static<T>) {
    const [resp] = await request<Static<T>>(`${resourcePath}/${id}`, {
      method: "put",
      body,
      token: token.current,
      ...options,
    });
    return resp;
  };
}

export function createRemoveRequestFn<T extends TSchema>({
  resourcePath,
  token,
  ...options
}: RequestCreatorOptions) {
  return async function remove(id: string | number, body: Static<T>) {
    await request<Static<T>, void>(`${resourcePath}/${id}`, {
      method: "delete",
      body,
      token: token.current,
      ...options,
    });
    return body;
  };
}
