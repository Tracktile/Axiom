import { createModel, T, Static } from "../../src";

export const User = createModel({
  /**
   * The Name of the model
   */
  name: "User",
  /**
   * The API resource which services the model following rest standards
   * Expecting this API shape:
   * GET /resource          - Returns an array of models
   * GET /resource/:id      - Returns a single model by id
   * POST /resource         - Creates a new model
   * PUT /resource/:id      - Updates an existing model by id
   * DELETE /resource/:id   - Deletes an existing model by id
   */
  resource: "/users",
  /**
   * The key in the model that represents it's unique identifier
   */
  idKey: "id",
  /**
   * A schema to validate /:var/:parts within a models resource.
   */
  path: T.Object({
    name: T.Optional(T.String()),
  }),
  /**
   * A schema of query parameters supported by the endpoint
   */
  query: T.Object({
    name: T.Optional(T.String()),
    email: T.Optional(T.String()),
  }),
  /**
   * The schema for the entire model, as it is returned for the backend.
   */
  model: T.Object({
    id: T.String(),
    email: T.String(),
    name: T.String(),
    status: T.String(),
  }),
  /**
   * The POST body schema required for model creation
   */
  create: T.Object({
    name: T.String(),
    email: T.String(),
  }),
  /**
   * The PUT body schema required to update a model
   */
  update: T.Object({
    name: T.String(),
  }),
  /**
   * The DELETE body schema for model deletion
   */
  del: T.Undefined(),
  /**
   * Transformers
   * Functions that will be used to serialized or deserialize data
   * as it is sent to and returned from your API.
   * Schema validation occurs before serialization and deserialization
   *
   * If supplying serialize, deserialize is also required.
   */
  transformer: (model) => ({ hello: "world" }),
});

export type User = Static<typeof User.schemas.model>;
