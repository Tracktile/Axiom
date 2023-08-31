import { createRef, MutableRefObject } from "react";
import {
  QueryClient,
  useQuery,
  useInfiniteQuery,
  useMutation,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";

import { Static, TSchema, Model } from "../common";

import {
  buildResourcePath,
  createCreateRequestFn,
  createGetRequestFn,
  createRemoveRequestFn,
  createSearchRequestFn,
  createUpdateRequestFn,
} from "./request";

import { SearchQuery } from "./api";

type AxiomQueryOptions = {
  offset?: number;
  limit?: number;
  orderBy?: string;
  fields?: SearchQuery["fields"];
};

type AxiomModelGetOptions<T> = UseQueryOptions<T, Error>;

type AxiomModelMutationOptions<
  TModal extends TSchema,
  TArgs extends TSchema,
> = UseMutationOptions<Static<TModal>, unknown, Static<TArgs>, unknown>;

type TContext<TData = undefined> = { previous?: TData };

interface ModelBindOptions {
  client: QueryClient;
  baseUrl: string;
  token: MutableRefObject<string | null>;
}

export interface ReactModelOptions<
  TModel extends Model<any, any, any, any, any, any, any>,
> {
  model: TModel;
  baseUrl: string;
}

export class ReactModel<
  TModel extends Model<any, any, any, any, any, any, TTransform>,
  TTransform extends (serialized: Static<TModel["schemas"]["model"]>) => any,
> {
  model: TModel;
  client?: QueryClient;
  baseUrl: string;
  token: MutableRefObject<string | null>;

  constructor(options: ReactModelOptions<TModel>) {
    this.model = options.model;
    this.token = createRef<string | null>();
    this.baseUrl = "";
  }

  transform(
    serialized: Static<TModel["schemas"]["model"]>
  ): ReturnType<TTransform> {
    return this.model.transformer(serialized);
  }

  modelKeys = {
    search: (params: SearchQuery = {}) => [
      this.model.name,
      ...(params ? [params] : []),
    ],
    get: (id: any) => [this.model.name, id],
    create: () => [this.model.name, "create"],
    update: (id?: any) => [this.model.name, id, "update"],
    remove: (id?: any) => [this.model.name, id, "remove"],
  };

  private bindCreateMutation() {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    this.client.setMutationDefaults(this.modelKeys.create(), {
      mutationFn: (item: Static<TModel["schemas"]["create"]>) => {
        return createCreateRequestFn<TModel["schemas"]["model"]>({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
          token: this.token,
        })(item);
      },
      onMutate: async (
        item: Static<TModel["schemas"]["model"]>
      ): Promise<TContext<Static<TModel["schemas"]["model"]>>> => {
        if (!this.client) {
          throw new Error("Client is not bound");
        }
        await this.client.cancelQueries({
          queryKey: this.modelKeys.get(item[this.model.idKey]),
        });
        const previous = this.client.getQueryData<
          Static<TModel["schemas"]["model"]>
        >(this.modelKeys.get(item[this.model.idKey]));
        this.client.setQueryData(
          this.modelKeys.get(item[this.model.idKey]),
          item
        );
        this.client.setQueryData<Static<TModel["schemas"]["model"]>>(
          this.modelKeys.get(item[this.model.idKey]),
          () => item
        );
        return { previous };
      },
      onSuccess: (item: Static<TModel["schemas"]["model"]>) => {
        if (!this.client) {
          throw new Error("Client is not bound");
        }
        this.client.invalidateQueries({
          queryKey: this.modelKeys.get(item[this.model.idKey]),
        });
      },
      onError: (
        _err: Error,
        item: Static<TModel["schemas"]["model"]>,
        context?: TContext<Static<TModel["schemas"]["model"]>>
      ) => {
        if (!!context?.previous) {
          if (!this.client) {
            throw new Error("Client is not bound");
          }
          this.client.setQueryData(
            this.modelKeys.get(item[this.model.idKey]),
            context.previous
          );
          this.client.setQueryData<Static<TModel["schemas"]["model"]>>(
            this.modelKeys.get(item[this.model.idKey]),
            () => undefined
          );
        }
      },
    });
  }

  bindUpdateMutation() {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    this.client.setMutationDefaults(this.modelKeys.update(), {
      mutationFn: (item: Static<TModel["schemas"]["model"]>) => {
        return createUpdateRequestFn<TModel["schemas"]["model"]>({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
          idKey: this.model.idKey,
          token: this.token,
        })(item);
      },
      onMutate: async (
        item: Static<TModel["schemas"]["model"]>
      ): Promise<TContext<Static<TModel["schemas"]["model"]>>> => {
        if (!this.client) {
          throw new Error("Client is not bound");
        }
        await this.client.cancelQueries({
          queryKey: this.modelKeys.get(item[this.model.idKey]),
        });
        const previous = this.client.getQueryData<
          Static<TModel["schemas"]["model"]>
        >(this.modelKeys.get(item[this.model.idKey]));
        this.client.setQueryData(
          this.modelKeys.get(item[this.model.idKey]),
          item
        );
        return { previous };
      },
      onSuccess: () => {},
      onError: (
        _err: Error,
        item: Static<TModel["schemas"]["model"]>,
        context?: TContext<Static<TModel["schemas"]["model"]>>
      ) => {
        if (!!context?.previous) {
          if (!this.client) {
            throw new Error("Client is not bound");
          }
          this.client.setQueryData(
            this.modelKeys.get(item[this.model.idKey]),
            context.previous
          );
        }
      },
    });
  }

  bindRemoveMutation() {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    this.client.setMutationDefaults(this.modelKeys.remove(), {
      retry: false,
      mutationFn: (item: Static<TModel["schemas"]["model"]>) =>
        createRemoveRequestFn<TModel["schemas"]["model"]>({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
          token: this.token,
          idKey: this.model.idKey,
        })(item),
      onMutate: async (
        item: Static<TModel["schemas"]["model"]>
      ): Promise<TContext<Static<TModel["schemas"]["model"]>>> => {
        if (!this.client) {
          throw new Error("Client is not bound");
        }
        await this.client.cancelQueries({
          queryKey: this.modelKeys.remove(item[this.model.idKey]),
        });

        const previous = this.client.getQueryData<
          Static<TModel["schemas"]["model"]>
        >(this.modelKeys.get(item[this.model.idKey]));
        this.client.setQueryData(
          this.modelKeys.get(item[this.model.idKey]),
          null
        );
        return { previous };
      },
      onSuccess: () => {},
      onError: (
        _err: Error,
        item: Static<TModel["schemas"]["model"]>,
        context?: TContext<Static<TModel["schemas"]["model"]>>
      ) => {
        if (typeof context?.previous !== "undefined") {
          if (!this.client) {
            throw new Error("Client is not bound");
          }
          this.client.setQueryData(
            this.modelKeys.get(item[this.model.idKey]),
            context.previous
          );
        }
      },
    });
  }

  bind({ client, baseUrl, token }: ModelBindOptions) {
    this.client = client;
    this.baseUrl = baseUrl;
    this.token = token;
    this.bindCreateMutation();
    this.bindUpdateMutation();
    this.bindRemoveMutation();
    return this;
  }

  get(
    id: string | number,
    options: Partial<
      AxiomModelGetOptions<ReturnType<TModel["transformer"]>>
    > = {}
  ) {
    return useQuery({
      ...options,
      queryKey: this.modelKeys.get(id),
      enabled: !!id,
      queryFn: () =>
        createGetRequestFn<TModel["schemas"]["model"]>({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
          token: this.token,
        })(id),
      select: (data) => {
        return this.transform(data);
      },
    });
  }

  query({
    offset: offsetArg,
    limit = 99,
    orderBy,
    fields = [],
  }: AxiomQueryOptions = {}) {
    const queryFn = async ({ pageParam = 0 }) => {
      const offset = offsetArg ?? (pageParam as number);
      const { results, total } = await createSearchRequestFn<
        TModel["schemas"]["model"]
      >({
        resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
        token: this.token,
      })({
        limit,
        offset,
        orderBy,
        ...parseSearchQuery(fields),
      });
      return {
        results,
        total,
        offset,
        limit,
      };
    };

    const query = useInfiniteQuery({
      queryKey: this.modelKeys.search({
        orderBy,
        fields,
      }),
      queryFn,
      initialData: {
        pages: [],
        pageParams: [],
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        return (lastPage?.offset ?? 0) + lastPage?.results?.length ?? 0;
      },
      getPreviousPageParam: (firstPage) => {
        return (firstPage?.offset ?? 0) - firstPage?.results?.length ?? 0;
      },
      select: ({ pages, pageParams }) => {
        return {
          pages: pages.map((page) => ({
            ...page,
            results: page.results.map((d) => this.transform(d)),
          })),
          pageParams: pageParams,
        };
      },
    });
    const { data, ...queryResult } = query;
    return {
      ...queryResult,
      data: data?.pages.map((page) => page.results).flat() ?? [],
      pages: data?.pages ?? [],
    };
  }

  create(
    options: AxiomModelMutationOptions<
      TModel["schemas"]["model"],
      TModel["schemas"]["create"]
    > = {}
  ) {
    return useMutation<
      Static<TModel["schemas"]["model"]>,
      unknown,
      Static<TModel["schemas"]["create"]>
    >({
      mutationKey: this.modelKeys.create(),
      ...options,
    });
  }

  update(
    options: AxiomModelMutationOptions<
      TModel["schemas"]["model"],
      TModel["schemas"]["update"]
    > = {}
  ) {
    return useMutation<
      Static<TModel["schemas"]["model"]>,
      unknown,
      Static<TModel["schemas"]["update"]>
    >({
      mutationKey: this.modelKeys.update(),
      ...options,
    });
  }

  remove(
    options: AxiomModelMutationOptions<
      TModel["schemas"]["model"],
      TModel["schemas"]["model"]
    > = {}
  ) {
    return useMutation<
      Static<TModel["schemas"]["model"]>,
      unknown,
      Static<TModel["schemas"]["model"]>
    >({
      mutationKey: this.modelKeys.remove(),
      ...options,
    });
  }

  invalidate() {
    this.client?.invalidateQueries({ queryKey: this.modelKeys.search() });
  }

  invalidateById(id: keyof Static<TModel["schemas"]["model"]>) {
    this.client?.invalidateQueries({ queryKey: this.modelKeys.get(id) });
  }

  read(): Static<TModel["schemas"]["model"]>[] | undefined {
    return this.client?.getQueryData(this.modelKeys.search());
  }

  readOne(
    id: keyof Static<TModel["schemas"]["model"]>
  ): Static<TModel["schemas"]["model"]> | undefined {
    return this.client?.getQueryData(this.modelKeys.get(id));
  }
}

export type PaginationParams = {
  offset?: number;
  limit?: number;
  orderBy?: string;
};

const parseSearchQuery = (fields: Required<SearchQuery>["fields"]) =>
  fields.reduce((acc, { name, is, isOneOf, contains }) => {
    if (typeof is !== "undefined") {
      return {
        ...acc,
        [name]: is,
      };
    }
    if (typeof isOneOf !== "undefined") {
      return {
        ...acc,
        [name]: isOneOf.join(","),
      };
    }

    if (typeof contains !== "undefined") {
      return {
        ...acc,
        [name]: `%${contains}%`,
      };
    }

    return acc;
  }, {});
