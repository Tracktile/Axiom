import { Static, T, TObject, TSchema } from "../common";

export type ModelOptions<
  TModel extends TSchema,
  TCreate extends TSchema,
  TUpdate extends TSchema,
  TDelete extends TSchema,
  TQuery extends TSchema,
  TPath extends TSchema,
  TTransform extends (serialized: Static<TModel>) => any,
  TSortable extends TSchema,
> = {
  name: string;
  resource: string;
  idKey: Exclude<keyof Static<TModel>, symbol>;
  model: TModel;
  create?: TCreate;
  update?: TUpdate;
  del?: TDelete;
  query?: TQuery;
  path?: TPath;
  transformer: TTransform;
  sortableBy?: TSortable;
  _unstable_offlineModel?: boolean;
  staleTime?: number;
  gcTime?: number;
  infiniteSearch?: {
    enabled: boolean;
    defaultLimit?: number;
  };
};

export class Model<
  TModel extends TSchema,
  TCreate extends TSchema = TModel,
  TUpdate extends TSchema = TModel,
  TDelete extends TSchema = TObject,
  TQuery extends TSchema = TObject,
  TPath extends TSchema = TObject,
  TTransform extends (serialized: Static<TModel>) => any = (
    m: Static<TModel>
  ) => typeof m,
  TSortable extends TSchema = TModel,
> {
  name: string;
  resource: string;
  idKey: Exclude<keyof Static<TModel>, symbol>;
  schemas: {
    model: TModel;
    create: TCreate;
    update: TUpdate;
    del: TDelete;
    query: TQuery;
    path: TPath;
  };
  transformer: TTransform;
  sortableBy: TSortable;
  _unstable_offlineModel?: boolean;
  staleTime?: number;
  gcTime?: number;
  infiniteSearch?: {
    enabled: boolean;
    defaultLimit: number;
  };

  constructor(
    options: ModelOptions<
      TModel,
      TCreate,
      TUpdate,
      TDelete,
      TQuery,
      TPath,
      TTransform,
      TSortable
    >
  ) {
    this.name = options.name;
    this.resource = options.resource;
    this.idKey = options.idKey;
    this.schemas = {
      model: options.model,
      create: options.create ?? (options.model as unknown as TCreate),
      update: options.update ?? (options.model as unknown as TUpdate),
      del: options.del ?? (T.Object({}) as unknown as TDelete),
      path: options.path ?? (T.Object({}) as unknown as TPath),
      query: options.query ?? (T.Object({}) as unknown as TQuery),
    };
    this.transformer = options.transformer;
    this.sortableBy =
      options.sortableBy || (options.model as unknown as TSortable);
    this._unstable_offlineModel = options._unstable_offlineModel ?? false;
    this.staleTime = options.staleTime;
    this.gcTime = options.gcTime;
    this.infiniteSearch = options.infiniteSearch
      ? {
          enabled: options.infiniteSearch.enabled,
          defaultLimit: options.infiniteSearch.defaultLimit ?? 50,
        }
      : undefined;
  }

  getSearchResponseType(): TSchema {
    return T.Object({
      results: T.Array(this.schemas.model),
      nextCursor: T.Optional(T.String()),
      total: T.Number(),
      metadata: T.Object({
        currentResults: T.Number(),
        historicalResults: T.Number(),
        timePeriodCovered: T.Tuple([T.String(), T.String()]),
      }),
    });
  }

  getSearchParamsType(): TSchema {
    return T.Object({
      cursor: T.Optional(T.String()),
      limit: T.Optional(T.Number()),
      search: T.Optional(T.String()),
      filters: T.Optional(
        T.Array(
          T.Object({
            field: T.String(),
            operator: T.Union([
              T.Literal("eq"),
              T.Literal("contains"),
              T.Literal("gt"),
              T.Literal("lt"),
              T.Literal("between"),
            ]),
            value: T.Union([
              T.String(),
              T.Number(),
              T.Boolean(),
              T.Array(T.Union([T.String(), T.Number()])),
            ]),
          })
        )
      ),
      sort: T.Optional(
        T.Object({
          field: T.String(),
          direction: T.Union([T.Literal("asc"), T.Literal("desc")]),
        })
      ),
    });
  }
}

export const DEFAULT_CACHE_TIME = 300000;

export function createModel<
  TModel extends TSchema,
  TCreate extends TSchema,
  TUpdate extends TSchema,
  TDelete extends TSchema,
  TQuery extends TSchema,
  TPath extends TSchema,
  TTransformer extends (serialized: Static<TModel>) => any,
  TSortable extends TSchema = TModel,
>(
  options: ModelOptions<
    TModel,
    TCreate,
    TUpdate,
    TDelete,
    TQuery,
    TPath,
    TTransformer,
    TSortable
  >
) {
  return new Model<
    TModel,
    TCreate,
    TUpdate,
    TDelete,
    TQuery,
    TPath,
    TTransformer,
    TSortable
  >(options);
}
