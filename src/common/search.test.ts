import { describe, expect, it } from "vitest";
import {
  decodeSearchQuery,
  encodeSearchQuery,
  SearchQueryField,
} from "./search";

const FIELDS: SearchQueryField[] = [
  {
    name: "test_is",
    comparator: "and",
    is: "test",
  },
  {
    name: "test_contains",
    comparator: "or",
    contains: "test",
  },
  {
    name: "test_is_greater_than",
    comparator: "and",
    isGreaterThan: 1,
  },
  {
    name: "test_is_less_than",
    comparator: "and",
    isLessThan: 200,
  },
  {
    name: "test_is_between",
    comparator: "and",
    isBetween: [1, 200],
  },
  {
    name: "test_is_like_one_of",
    comparator: "and",
    isLikeOneOf: ["test", "test2"],
  },
  {
    name: "test_is_one_of",
    comparator: "and",
    isOneOf: ["test", "test2"],
  },
];

describe("encodeSearchQuery", () => {
  it("should encode search query", () => {
    expect(encodeSearchQuery(FIELDS)).toEqual({
      test_is: "and:test",
      test_contains: "or:%test%",
      test_is_greater_than: "and:>1",
      test_is_less_than: "and:<200",
      test_is_between: "and:>1,<200",
      test_is_like_one_of: "and:%test%,%test2%",
      test_is_one_of: "and:test,test2",
    });
  });
});

describe("decodeSearchQuery", () => {
  it("should decode search query back to original fields", () => {
    const encoded = encodeSearchQuery(FIELDS);
    const decoded = decodeSearchQuery(encoded);
    expect(decoded).toEqual(FIELDS);
  });
});
