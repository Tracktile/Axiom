import { T, Value } from "../common";
import {
  undefinedToNull,
  noEmptyStringValues,
  withDefaultsForStringFormats,
  noAdditionalProperties,
  shallowSchemaProperties,
} from "./utils";

describe("noEmptyStringValues()", () => {
  it("should remove keys from an object if their value is an empty stirng", () => {
    const obj = { hello: "world", goodbye: "", test: 1 };
    expect(noEmptyStringValues(obj)).toEqual({ hello: "world", test: 1 });
  });
});

describe("withDefaultsForStringFormats", () => {
  it("should add an empty default string to any strings with formats in the schema recursively", () => {
    const schema = T.Object({
      anyString: T.String(),
      stringWithFormat: T.String({ format: "uuid" }),
    });
    expect(
      withDefaultsForStringFormats(schema).properties.stringWithFormat.default
    ).toEqual("");
  });
});

describe("noAdditionalPropertiesNew", () => {
  it("should work", () => {
    const schema = T.Object({
      arr: T.Array(T.Object({ a: T.String(), b: T.Number() })),
      a: T.Object({
        a: T.String(),
        b: T.Number(),
      }),
      b: T.String(),
    });
    const input = {
      arr: [{ a: "hello", b: 1337, c: "goodbye", d: "??" }],
      a: {
        a: "hello",
        b: 1337,
        c: "goodbye",
      },
      b: "hello",
      c: "goodbye",
      z: "...",
    };
    expect(noAdditionalProperties(schema, input)).toEqual({
      arr: [{ a: "hello", b: 1337 }],
      a: {
        a: "hello",
        b: 1337,
      },
      b: "hello",
    });
  });
});

describe("shallowSchemaProperties", () => {
  it("should accept a TObject schema and return the schema with shallow properties only (no object or arrays properties)", () => {
    const schema = T.Object({
      a: T.Number(),
      b: T.String(),
      c: T.Union([T.Literal("A"), T.Literal("B")]),
      d: T.Object({
        goodbye: T.String(),
      }),
      e: T.Array(T.String()),
      f: T.Array(T.Object({ goodbye: T.Number() })),
    });
    const shallow = shallowSchemaProperties(schema);
    expect(Object.keys(shallow.properties)).toEqual(["a", "b", "c"]);
  });
});

describe("undefinedToNull", () => {
  it("should transform any top level undefined values in an object to nulls", () => {
    const input = {
      a: undefined,
      b: "string",
      c: 0,
    };
    expect(undefinedToNull(input)).toEqual({
      a: null,
      b: "string",
      c: 0,
    });
  });
});
