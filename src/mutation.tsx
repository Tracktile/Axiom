import {
  MutationOptions,
  QueryClient,
  QueryKey,
  useMutation,
} from "@tanstack/react-query";
import { Static, TSchema } from "@sinclair/typebox";
import { ModelId } from "./model";

type TContext<TData = undefined> = { previous?: TData };

function replaceInWithBy<TData>(
  data: TData[],
  newItem: TData,
  replaceBy: keyof TData
) {
  return [
    ...data.filter((item) => {
      return item[replaceBy] !== newItem[replaceBy];
    }),
    newItem,
  ];
}

interface createCreateMutationOptions<T extends TSchema> {
  client: QueryClient;
  idKey?: keyof Static<T> | "id";
  createFn: (item: Static<T>) => Promise<Static<T>>;
  itemCacheKey: (id: ModelId) => QueryKey;
  itemIndexCacheKey: () => QueryKey;
}

export function createCreateMutation<T extends TSchema>(
  name: string,
  {
    client,
    idKey = "id",
    createFn,
    itemCacheKey,
    itemIndexCacheKey,
  }: createCreateMutationOptions<T>
) {
  const mutationName = `${name}_create`;
  client.setMutationDefaults([mutationName], {
    mutationFn: (item: Static<T>) => {
      return createFn(item);
    },
    onMutate: async (item: Static<T>): Promise<TContext<Static<T>>> => {
      await client.cancelQueries(
        itemCacheKey((item as Record<string, ModelId>)[idKey] as ModelId)
      );
      const previous = client.getQueryData<T>(
        itemCacheKey((item as Record<string, ModelId>)[idKey] as ModelId)
      );
      client.setQueryData(
        itemCacheKey((item as Record<string, ModelId>)[idKey] as ModelId),
        item
      );
      client.setQueryData<Static<T>[]>(itemIndexCacheKey(), (oldData = []) =>
        replaceInWithBy(oldData, item, idKey as keyof Static<T>)
      );
      return { previous };
    },
    onSuccess: () => {
      client.invalidateQueries(itemIndexCacheKey());
    },
    onError: (_err: Error, item: Static<T>, context?: TContext<Static<T>>) => {
      if (!!context?.previous) {
        client.setQueryData(
          itemCacheKey((item as Record<string, ModelId>)[idKey] as ModelId),
          context.previous
        );
        client.setQueryData<Static<T>[]>(itemIndexCacheKey(), (oldData = []) =>
          context.previous
            ? replaceInWithBy(
                oldData,
                context.previous,
                idKey as keyof Static<T>
              )
            : []
        );
      }
    },
  });
  return (options?: MutationOptions<Static<T>, unknown, Static<T>>) =>
    useMutation<Static<T>, unknown, Static<T>>([mutationName], options);
}

interface createUpdateMutationOptions<T extends TSchema> {
  client: QueryClient;
  idKey?: keyof Static<T> | "id";
  updateFn: (
    body: Static<T, []> & { id: "id" | keyof Static<T, []> }
  ) => Promise<Static<T, []>>;
  itemCacheKey: (id: ModelId) => QueryKey;
  itemIndexCacheKey: () => QueryKey;
}

export function createUpdateMutation<T extends TSchema>(
  name: string,
  {
    client,
    idKey = "id",
    updateFn,
    itemCacheKey,
    itemIndexCacheKey,
  }: createUpdateMutationOptions<T>
) {
  const mutationName = `${name}_update`;
  client.setMutationDefaults([mutationName], {
    mutationFn: (item: Static<T, []> & { id: "id" | keyof Static<T, []> }) => {
      return updateFn(item);
    },
    onMutate: async (item: Static<T>): Promise<TContext<Static<T>>> => {
      await client.cancelQueries(
        itemCacheKey((item as Record<string, ModelId>)[idKey] as ModelId)
      );
      const previous = client.getQueryData<T>(
        itemCacheKey((item as Record<string, ModelId>)[idKey] as ModelId)
      );
      client.setQueryData(
        itemCacheKey((item as Record<string, ModelId>)[idKey] as ModelId),
        item
      );
      client.setQueryData<Static<T>[]>(itemIndexCacheKey(), (oldData = []) =>
        oldData.map((oldItem) => {
          const itemId = (item as Record<string, ModelId>)[idKey] as ModelId;
          const oldItemId = (oldItem as Record<string, ModelId>)[
            idKey
          ] as ModelId;
          return itemId === oldItemId ? item : oldItem;
        })
      );
      return { previous };
    },
    onSuccess: () => {
      client.invalidateQueries(itemIndexCacheKey());
    },
    onError: (_err: Error, item: Static<T>, context?: TContext<Static<T>>) => {
      if (!!context?.previous) {
        client.setQueryData(
          itemCacheKey((item as Record<string, ModelId>)[idKey] as ModelId),
          context.previous
        );
        client.setQueryData<Static<T>[]>(itemIndexCacheKey(), (oldData = []) =>
          context.previous
            ? replaceInWithBy(
                oldData,
                context.previous,
                idKey as keyof Static<T>
              )
            : []
        );
      }
    },
  });
  return (options?: MutationOptions<Static<T>, unknown, Static<T>>) =>
    useMutation<Static<T>, unknown, Static<T>>([mutationName], options);
}

interface DeletePersistMutationOptions<T extends TSchema> {
  client: QueryClient;
  idKey?: keyof Static<T> | "id";
  deleteFn: (item: Static<T> & { id: ModelId }) => Promise<void>;
  itemCacheKey: (id: ModelId) => QueryKey;
  itemIndexCacheKey: () => QueryKey;
}

export function createDeleteMutation<T extends TSchema>(
  name: string,
  {
    client,
    idKey = "id",
    itemCacheKey,
    itemIndexCacheKey,
    deleteFn,
  }: DeletePersistMutationOptions<T>
) {
  const mutationName = `${name}_delete`;
  client.setMutationDefaults([mutationName], {
    retry: 0,
    mutationFn: (item: Static<T> & { id: ModelId }) => deleteFn(item),
    onMutate: async (item: Static<T>): Promise<TContext<Static<T>>> => {
      await client.cancelQueries(
        itemCacheKey((item as Record<string, ModelId>)[idKey] as ModelId)
      );
      const previous = client.getQueryData<T>(
        itemCacheKey((item as Record<string, ModelId>)[idKey] as ModelId)
      );
      client.setQueryData(
        itemCacheKey((item as Record<string, ModelId>)[idKey] as ModelId),
        null
      );
      client.setQueryData<Static<T>[]>(itemIndexCacheKey(), (oldData = []) =>
        oldData.filter(
          (old) =>
            (old as Record<typeof idKey, ModelId>)[idKey] !==
            ((item as Record<string, ModelId>)[idKey] as ModelId)
        )
      );
      return { previous };
    },
    onSuccess: () => {
      client.invalidateQueries(itemIndexCacheKey());
    },
    onError: (_err: Error, item: Static<T>, context?: TContext<Static<T>>) => {
      if (typeof context?.previous !== "undefined") {
        client.setQueryData(
          itemCacheKey((item as Record<string, ModelId>)[idKey] as ModelId),
          context.previous
        );
        client.setQueryData<Static<T>[]>(itemIndexCacheKey(), (oldData = []) =>
          context.previous
            ? replaceInWithBy(
                oldData,
                context.previous,
                idKey as keyof Static<T>
              )
            : []
        );
      }
    },
  });
  return (options?: MutationOptions<Static<T>, unknown, Static<T>>) =>
    useMutation<Static<T>, unknown, Static<T>>([mutationName], options);
}
