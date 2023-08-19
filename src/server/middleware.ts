import { DefaultState, Middleware, Next } from "koa";

import { OperationContext } from "./types";

export function compose<TContext extends OperationContext>(
  middleware: Middleware<DefaultState, TContext>[]
) {
  return async (context: TContext, next: Next) => {
    let index = -1;
    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        return Promise.reject(new Error("next() called multiple times"));
      }
      index = i;
      let fn = middleware[i];
      if (i === middleware.length) {
        fn = next;
      }
      if (!fn) {
        return Promise.resolve();
      }
      try {
        return await fn(context, dispatch.bind(null, i + 1));
      } catch (err) {
        return Promise.reject(err);
      }
    };
    return dispatch(0);
  };
}
