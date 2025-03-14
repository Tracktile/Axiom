import { TSchema } from "./typebox";

export interface ResourceOptions<
  TResp extends TSchema,
  TParams extends TSchema,
> {
  name: string;
  resource: string;
  schema: TResp;
  params: TParams;
}

export class Resource<TResp extends TSchema, TParams extends TSchema> {
  name: string;
  resource: string;
  schema: TResp;
  params: TParams;

  constructor(options: ResourceOptions<TResp, TParams>) {
    this.name = options.name;
    this.resource = options.resource;
    this.schema = options.schema;
    this.params = options.params;
  }
}

export function createResource<TResp extends TSchema, TParams extends TSchema>(
  options: ResourceOptions<TResp, TParams>
): Resource<TResp, TParams> {
  return new Resource(options);
}
