import { useQueryClient } from "@tanstack/react-query";
import { createApiModel } from "./model";

type Model = ReturnType<typeof createApiModel>;
type BoundModelMap = Record<string, ReturnType<Model>>;

export const useApi = (
  Models: Record<string, ReturnType<typeof createApiModel>>
) => {
  const queryClient = useQueryClient();
  const api = Object.entries(Models).reduce(
    (acc, [name, model]) => ({ ...acc, [name]: model(queryClient) }),
    {} as BoundModelMap
  );
  return api;
};
