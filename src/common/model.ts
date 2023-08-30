import { TSchema, Static } from "../common";

export type ModelOptions<
  TModel extends TSchema,
  TCreate extends TSchema = TModel,
  TUpdate extends TSchema = TModel,
  TDelete extends TSchema = TModel,
  TQuery extends TSchema = TModel,
  TPath extends TSchema = TModel,
> = {
  name: string;
  resource: string;
  idKey: Exclude<keyof Static<TModel>, symbol>;
  model: TModel;
  create: TCreate;
  update: TUpdate;
  del: TDelete;
  query: TQuery;
  path: TPath;
};

export class Model<
  TModel extends TSchema,
  TCreate extends TSchema,
  TUpdate extends TSchema,
  TDelete extends TSchema,
  TQuery extends TSchema,
  TPath extends TSchema,
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

  constructor(
    options: ModelOptions<TModel, TCreate, TUpdate, TDelete, TQuery, TPath>
  ) {
    this.name = options.name;
    this.resource = options.resource;
    this.idKey = options.idKey;
    this.schemas = {
      model: options.model,
      create: options.create,
      update: options.update,
      del: options.del,
      path: options.path,
      query: options.query,
    };
  }
}

export function createModel<
  TModel extends TSchema,
  TCreate extends TSchema,
  TUpdate extends TSchema,
  TDelete extends TSchema,
  TQuery extends TSchema,
  TPath extends TSchema,
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
}: ModelOptions<TModel, TCreate, TUpdate, TDelete, TQuery, TPath>) {
  return new Model<TModel, TCreate, TUpdate, TDelete, TQuery, TPath>({
    name,
    resource,
    idKey,
    model,
    create,
    update,
    del,
    query,
    path,
  });
}
