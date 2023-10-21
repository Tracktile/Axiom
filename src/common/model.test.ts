import { T } from "../common";
import { createModel } from "./model";

describe("Model", () => {
  it("should be possible to define a model with only a name, resource, and model schema.", () => {
    const model = createModel({
      name: "test",
      resource: "test",
      idKey: "id",
      model: T.Object({
        id: T.String(),
      }),
    });
    expect(model).toBeDefined();
    expect(model.schemas.create).toEqual(model.schemas.model);
    expect(model.schemas.update).toEqual(model.schemas.model);
    expect(model.schemas.del).toEqual(T.Object({}));
    expect(model.schemas.query).toEqual(T.Object({}));
    expect(model.schemas.path).toEqual(T.Object({}));
  });

  it("should de possible to define a model with a custom create, update, del, query, and path schema", () => {
    const model = createModel({
      name: "test",
      resource: "test",
      idKey: "id",
      model: T.Object({
        id: T.String(),
        createdAt: T.String(),
        updatedAt: T.String(),
      }),
      create: T.Object({
        id: T.String(),
      }),
      update: T.Object({
        id: T.String(),
      }),
      del: T.Object({
        id: T.String(),
      }),
      query: T.Object({
        id: T.String(),
      }),
      path: T.Object({
        id: T.String(),
      }),
    });
    expect(model).toBeDefined();
    expect(model.schemas.create).not.toEqual(model.schemas.model);
    expect(model.schemas.update).not.toEqual(model.schemas.model);
    expect(model.schemas.del).not.toEqual(T.Object({}));
    expect(model.schemas.query).not.toEqual(T.Object({}));
    expect(model.schemas.path).not.toEqual(T.Object({}));
  });
});
