import Router from '@koa/router';
import Koa, { Middleware, DefaultState, ParameterizedContext, DefaultContext, Next } from 'koa';
import * as _koa_cors from '@koa/cors';
import { Options } from '@koa/cors';
import { TSchema, TUnion, TNull, Static } from '@sinclair/typebox';
import { Handler } from 'aws-lambda';

type Contact = {
    name: string;
    email: string;
    url: string;
};
type License = {
    name: string;
    url: string;
};
type Server = {
    description: string;
    url: string;
};
interface ServiceOptions<TExtend = Record<string, never>> {
    title?: string;
    description?: string;
    tags?: string[];
    prefix?: string;
    version?: string;
    internal?: boolean;
    license?: License;
    contact?: Contact;
    servers?: Server[];
    controllers?: Controller<TExtend>[];
    middlewares?: Middleware<DefaultState, any>[];
    config?: Partial<ServiceConfiguration>;
    onError?: (error: Error) => void;
}
interface ServiceConfiguration {
    /**
     * Options for the CORS middleware.
     * See Koa Cors for more information.
     */
    cors?: Options;
}
declare const DEFAULT_SERVICE_CONFIGURATION: ServiceConfiguration;
declare function isService(service: unknown): service is Service;
declare class Service<TExtend = Record<string, unknown>> extends Koa<DefaultState, unknown> {
    version: string;
    title: string;
    description: string;
    tags: string[];
    prefix: string;
    internal: boolean;
    contact: Contact;
    license: License;
    servers: Server[];
    controllers: Controller<TExtend>[];
    children: Service<TExtend>[];
    middleware: Middleware<DefaultState, unknown>[];
    router: Router<DefaultState, TExtend>;
    config: ServiceConfiguration;
    onError?: (error: Error) => void;
    constructor({ title, description, prefix, version, servers, contact, license, internal, tags, controllers, middlewares, config, onError, }: ServiceOptions<TExtend>);
    register(controller: Controller<TExtend>): void;
    bind(target?: Router<DefaultState, TExtend>): void;
    init(target?: Router<DefaultState, TExtend>): void;
    start(port?: number, addresses?: string[]): void;
}

declare const Nullable: <T extends TSchema>(schema: T) => TUnion<[T, TNull]>;
type OperationContext<T extends OperationDefinition<TSchema, TSchema, TSchema, TSchema> = OperationDefinition<TSchema, TSchema, TSchema, TSchema>, TExtend = Record<string, unknown>> = ParameterizedContext<DefaultState, DefaultContext, Static<T["res"]>> & TExtend & {
    body: Static<T["res"]>;
    query: Static<T["query"]>;
    params: Static<T["params"]>;
    request: ParameterizedContext["request"] & {
        body: Static<T["req"]>;
    };
};
type OperationDefinition<TParams extends TSchema, TQuery extends TSchema, TReq extends TSchema, TRes extends TSchema> = {
    name: string;
    method: "get" | "post" | "put" | "patch" | "delete";
    summary: string;
    internal?: boolean;
    description: string;
    path: string;
    params: TParams;
    auth: boolean;
    query: TQuery;
    req: TReq;
    res: TRes;
    middleware: Middleware<DefaultState, OperationContext>[];
    tags: string[];
};
type Operation<TParams extends TSchema, TQuery extends TSchema, TReq extends TSchema, TRes extends TSchema> = Partial<OperationDefinition<TParams, TQuery, TReq, TRes>> & Pick<OperationDefinition<TParams, TQuery, TReq, TRes>, "name" | "method" | "path">;

interface ControllerOptions {
    prefix?: string;
    tags?: string[];
    auth?: boolean;
    internal?: boolean;
    group?: string;
    middleware?: Middleware<DefaultState, OperationContext>[];
}
type RouteHandler<TParams extends TSchema, TQuery extends TSchema, TReq extends TSchema, TRes extends TSchema, TExtend> = (ctx: OperationContext<OperationDefinition<TParams, TQuery, TReq, TRes>, TExtend>, next: Next) => Promise<void>;
declare class Controller<TExtend = Record<string, unknown>> {
    service: Service<TExtend>;
    prefix: string;
    tags: string[];
    auth: boolean;
    group?: string;
    internal: boolean;
    preMatchedRouteMiddleware: Middleware<DefaultState, OperationContext>[];
    router: Router<DefaultState, unknown>;
    operations: [
        OperationDefinition<TSchema, TSchema, TSchema, TSchema>,
        (ctx: OperationContext<OperationDefinition<TSchema, TSchema, TSchema, TSchema>, TExtend>, next: Next) => Promise<void>
    ][];
    constructor({ prefix, middleware, tags, group, auth, internal, }?: ControllerOptions);
    routes(): Router.Middleware<DefaultState, unknown, unknown>;
    allowedMethods(): Router.Middleware<DefaultState, unknown, unknown>;
    getOperations(): [OperationDefinition<TSchema, TSchema, TSchema, TSchema>, (ctx: OperationContext<OperationDefinition<TSchema, TSchema, TSchema, TSchema>, TExtend>, next: Next) => Promise<void>][];
    private createOperation;
    private processResponseBody;
    register<T extends OperationDefinition<TSchema, TSchema, TSchema, TSchema>>(definition: T, path: string, methods: string[], routeMiddleware: Middleware<DefaultState, OperationContext<T, TExtend>>[], options?: Router.LayerOptions): Router.Layer;
    bind(router?: Router<DefaultState, unknown>): void;
    addOperation<TParams extends TSchema, TQuery extends TSchema, TReq extends TSchema, TRes extends TSchema>(definition: Operation<TParams, TQuery, TReq, TRes>, ...handlers: RouteHandler<TParams, TQuery, TReq, TRes, TExtend>[]): void;
}

interface CombinedServiceConfiguration extends ServiceConfiguration {
    title?: string;
    description?: string;
    tags?: string[];
    logo?: string;
    version?: string;
    contact?: Contact;
    license?: License;
    servers?: Server[];
    onError?: (err: Error) => void;
}
interface CombinedServiceOptions<TExtend = Record<string, never>> extends ServiceOptions<TExtend> {
    children: Service<TExtend>[];
    logo?: string;
}
declare const DEFAULT_COMBINED_SERVICE_CONFIGURATION: {
    readonly title: "";
    readonly description: "";
    readonly tags: string[];
    readonly contact: {
        readonly name: "";
        readonly email: "";
        readonly url: "";
    };
    readonly license: {
        readonly name: "";
        readonly url: "";
    };
    readonly cors?: _koa_cors.Options;
};
declare function isCombinedService<TExtend = Record<string, never>>(service: Service<TExtend> | CombinedService<TExtend>): service is CombinedService<TExtend>;
declare class CombinedService<TExtend = Record<string, never>> extends Service<TExtend> {
    children: Service<TExtend>[];
    logo?: string;
    constructor({ children, logo, ...options }: CombinedServiceOptions<TExtend>);
}
/**
 * Utility method for creating a single Axiom Service out of many independent services.
 * Useful when spinning up many microservices as a monolithic gateway bound to a single port.
 *
 * This method skips the regular bind phase of each service and instead creates an independent
 * Router for each service on which that services middleware and individual controllers are mounted
 * at the appropriate prefix.
 */
declare function combineServices<TExtend = Record<string, never>>(services: Service<TExtend>[], config?: CombinedServiceConfiguration): Service<TExtend>;

declare const serverless: <TExtend = Record<string, never>>(service: Service<TExtend>, corsOptions?: Options) => Handler;

declare function compose<TContext extends OperationContext>(middleware: Middleware<DefaultState, TContext>[]): (context: TContext, next: Next) => Promise<void>;

export { CombinedService, type CombinedServiceConfiguration, type CombinedServiceOptions, type Contact, Controller, DEFAULT_COMBINED_SERVICE_CONFIGURATION, DEFAULT_SERVICE_CONFIGURATION, type License, Nullable, type Operation, type OperationContext, type OperationDefinition, type Server, Service, type ServiceConfiguration, type ServiceOptions, combineServices, compose, isCombinedService, isService, serverless };
