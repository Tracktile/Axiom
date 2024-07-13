import Cors, { Options as CorsOptions } from "@koa/cors";
import serverlessExpress, {
  getCurrentInvoke,
} from "@vendia/serverless-express";
import type { Handler } from "aws-lambda";
import { RequestListener } from "http";
import Koa, { Context, Next, DefaultState } from "koa";

import { Service } from "./service";

interface ConfigureParams {
  app: RequestListener;
  resolutionMode: string;
}

export const serverless = <TExtend = Record<string, never>>(
  service: Service<TExtend>,
  corsOptions?: CorsOptions
): Handler => {
  const constructWrappedKoaApp = (
    app: Service<TExtend>
  ): Koa<DefaultState, TExtend> => {
    const wrapperApp = new Koa<DefaultState, TExtend>({});
    wrapperApp.proxy = true;
    wrapperApp.use(Cors(corsOptions));
    wrapperApp.use(async (ctx: Context, next: Next) => {
      const { event } = getCurrentInvoke();
      ctx.path = event.requestContext.path;
      ctx.url = event.requestContext.path;
      ctx.query = event.queryStringParameters;
      await next();
    });

    app.use(Cors(corsOptions));
    app.bind();

    wrapperApp.use(app.router.routes());
    wrapperApp.use(app.router.allowedMethods());

    return wrapperApp;
  };

  return serverlessExpress({
    app: constructWrappedKoaApp(service).callback(),
    resolutionMode: "PROMISE",
  } as unknown as ConfigureParams);
};
