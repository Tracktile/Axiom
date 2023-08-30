import {
  MutationOptions,
  QueryClient,
  QueryKey,
  useMutation,
} from "@tanstack/react-query";
import { Static, TSchema } from "../common";

type TContext<TData = undefined> = { previous?: TData };

export function replaceInWithBy<TData>(
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
  idKey: Exclude<keyof Static<T>, symbol>;
  createFn: (item: Static<T>) => Promise<Static<T>>;
  itemCacheKey: (id: any) => QueryKey;
  itemIndexCacheKey: () => QueryKey;
}

export function createCreateMutation<T extends TSchema>(
  name: string,
  {
    client,
    idKey,
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
      await client.cancelQueries({
        queryKey: itemCacheKey(item[idKey]),
      });
      const previous = client.getQueryData<T>(itemCacheKey(item[idKey]));
      client.setQueryData(itemCacheKey(item[idKey]), item);
      client.setQueryData<Static<T>[]>(itemIndexCacheKey(), (oldData = []) =>
        replaceInWithBy(oldData, item, idKey as keyof Static<T>)
      );
      client.setQueryData<Static<T>>(itemCacheKey(item[idKey]), () => item);
      return { previous };
    },
    onSuccess: (item: Static<T>) => {
      client.invalidateQueries({ queryKey: itemIndexCacheKey() });
      client.invalidateQueries({
        queryKey: itemCacheKey(item[idKey]),
      });
    },
    onError: (_err: Error, item: Static<T>, context?: TContext<Static<T>>) => {
      if (!!context?.previous) {
        client.setQueryData(itemCacheKey(item[idKey]), context.previous);
        client.setQueryData<Static<T>[]>(itemIndexCacheKey(), (oldData = []) =>
          context.previous
            ? replaceInWithBy(
                oldData,
                context.previous,
                idKey as keyof Static<T>
              )
            : []
        );
        client.setQueryData<Static<T>>(
          itemCacheKey(item[idKey]),
          () => undefined
        );
      }
    },
  });
  return (options?: MutationOptions<Static<T>, unknown, Static<T>>) =>
    useMutation<Static<T>, unknown, Static<T>>({
      mutationKey: [mutationName],
      ...options,
    });
}

interface createUpdateMutationOptions<T extends TSchema> {
  client: QueryClient;
  idKey: keyof Static<T>;
  updateFn: (body: Static<T, []>) => Promise<Static<T, []>>;
  itemCacheKey: (id: any) => QueryKey;
  itemIndexCacheKey: () => QueryKey;
}

export function createUpdateMutation<T extends TSchema>(
  name: string,
  {
    client,
    idKey,
    updateFn,
    itemCacheKey,
    itemIndexCacheKey,
  }: createUpdateMutationOptions<T>
) {
  const mutationName = `${name}_update`;
  client.setMutationDefaults([mutationName], {
    mutationFn: (item: Static<T, []>) => {
      return updateFn(item);
    },
    onMutate: async (item: Static<T>): Promise<TContext<Static<T>>> => {
      await client.cancelQueries({
        queryKey: itemCacheKey(item[idKey]),
      });
      const previous = client.getQueryData<T>(itemCacheKey(item[idKey]));
      client.setQueryData(itemCacheKey(item[idKey]), item);
      client.setQueryData<Static<T>[]>(itemIndexCacheKey(), (oldData = []) =>
        oldData.map((oldItem) => {
          const itemId = item[idKey];
          const oldItemId = oldItem[idKey];
          return itemId === oldItemId ? item : oldItem;
        })
      );
      return { previous };
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: itemIndexCacheKey() });
    },
    onError: (_err: Error, item: Static<T>, context?: TContext<Static<T>>) => {
      if (!!context?.previous) {
        client.setQueryData(itemCacheKey(item[idKey]), context.previous);
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
    useMutation<Static<T>, unknown, Static<T>>({
      mutationKey: [mutationName],
      ...options,
    });
}

interface DeletePersistMutationOptions<T extends TSchema> {
  client: QueryClient;
  idKey: keyof Static<T>;
  deleteFn: (item: Static<T>) => Promise<Static<T>>;
  itemCacheKey: (id: any) => QueryKey;
  itemIndexCacheKey: () => QueryKey;
}

export function createDeleteMutation<T extends TSchema>(
  name: string,
  {
    client,
    idKey,
    itemCacheKey,
    itemIndexCacheKey,
    deleteFn,
  }: DeletePersistMutationOptions<T>
) {
  const mutationName = `${name}_delete`;
  client.setMutationDefaults([mutationName], {
    retry: false,
    mutationFn: (item: Static<T>) => deleteFn(item),
    onMutate: async (item: Static<T>): Promise<TContext<Static<T>>> => {
      await client.cancelQueries({
        queryKey: itemCacheKey(item[idKey]),
      });

      const previous = client.getQueryData<T>(itemCacheKey(item[idKey]));
      client.setQueryData(itemCacheKey(item[idKey]), null);
      client.setQueryData<Static<T>[]>(itemIndexCacheKey(), (oldData = []) =>
        oldData.filter((old) => old[idKey] !== item[idKey])
      );
      return { previous };
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: itemIndexCacheKey() });
    },
    onError: (_err: Error, item: Static<T>, context?: TContext<Static<T>>) => {
      if (typeof context?.previous !== "undefined") {
        client.setQueryData(itemCacheKey(item[idKey]), context.previous);
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
    useMutation<Static<T>, unknown, Static<T>>({
      mutationKey: [mutationName],
      ...options,
      onSuccess: (data, variables, context) => {
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
        client.invalidateQueries({ queryKey: itemIndexCacheKey() });
      },
    });
}
