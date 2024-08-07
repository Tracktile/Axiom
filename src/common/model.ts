import { T, TSchema, Static, TObject } from "../common";

export type ModelOptions<
  TModel extends TSchema,
  TCreate extends TSchema,
  TUpdate extends TSchema,
  TDelete extends TSchema,
  TQuery extends TSchema,
  TPath extends TSchema,
  TTransform extends (serialized: Static<TModel>) => any,
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

  constructor(
    options: ModelOptions<
      TModel,
      TCreate,
      TUpdate,
      TDelete,
      TQuery,
      TPath,
      TTransform
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
  }
}

export function createModel<
  TModel extends TSchema,
  TCreate extends TSchema,
  TUpdate extends TSchema,
  TDelete extends TSchema,
  TQuery extends TSchema,
  TPath extends TSchema,
  TTransformer extends (serialized: Static<TModel>) => any,
>({
  name,
  resource,
  idKey,
  model,
  create,
  update,
  del,
  query,
  path,
  transformer,
}: ModelOptions<
  TModel,
  TCreate,
  TUpdate,
  TDelete,
  TQuery,
  TPath,
  TTransformer
>) {
  return new Model<
    TModel,
    TCreate,
    TUpdate,
    TDelete,
    TQuery,
    TPath,
    TTransformer
  >({
    name,
    resource,
    idKey,
    model,
    create,
    update,
    del,
    query,
    path,
    transformer,
  });
}
