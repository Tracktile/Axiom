import { T } from "../";

export interface SearchMetadata {
  currentResults: number;
  historicalResults: number;
  timePeriodCovered: [string, string];
}

export const SearchMetadataSchema = T.Object({
  currentResults: T.Number(),
  historicalResults: T.Number(),
  timePeriodCovered: T.Tuple([T.String(), T.String()]),
});

export interface SearchResponse<T> {
  results: T[];
  nextCursor?: string;
  total: number;
  metadata: SearchMetadata;
}

export const SearchResponseSchema = T.Object({
  results: T.Array(T.Any()),
  nextCursor: T.Optional(T.String()),
  total: T.Number(),
  metadata: SearchMetadataSchema,
});

export interface SearchFilter {
  field: string;
  operator: "eq" | "contains" | "gt" | "lt" | "between";
  value: string | number | boolean | [string | number];
}

export const SearchFilterSchema = T.Object({
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
});

export interface SearchParams {
  cursor?: string;
  limit: number;
  search?: string;
  sort?: {
    field: string;
    direction: "asc" | "desc";
  };
}

export const SearchParamsSchema = T.Object({
  cursor: T.Optional(T.String()),
  limit: T.Number(),
  search: T.Optional(T.String()),
  sort: T.Optional(
    T.Object({
      field: T.String(),
      direction: T.Union([T.Literal("asc"), T.Literal("desc")]),
    })
  ),
});

export type SearchQueryField = {
  name: string;
  comparator?: "and" | "or";
  is?: string | number | boolean;
  contains?: string;
  isOneOf?: string[];
  isLikeOneOf?: string[];
  isGreaterThan?: string | number;
  isLessThan?: string | number;
  isBetween?: [string | number, string | number];
  isNull?: boolean;
};

export type OrderBy<T> = {
  key: Exclude<keyof T, symbol>;
  order: "asc" | "desc";
};

export type SearchQuery<TSortable = Record<string, unknown>> = {
  fields?: SearchQueryField[];
  offset?: number;
  limit?: number;
  orderBy?: string | OrderBy<TSortable>;
};

export type SearchQueryResult<T> = {
  results: T[];
  total: number;
  offset?: number;
  limit: number;
};

export const encodeSearchQuery = <TSortable>(
  fields: Required<SearchQuery<TSortable>>["fields"]
): Record<string, string> =>
  fields.reduce(
    (
      acc,
      {
        name,
        comparator,
        is,
        isNull,
        isOneOf,
        isLikeOneOf,
        contains,
        isGreaterThan,
        isLessThan,
        isBetween,
      }
    ) => {
      if (typeof is !== "undefined") {
        return {
          ...acc,
          [name]: comparator ? `${comparator}:${is}` : is,
        };
      }
      if (typeof isNull !== "undefined") {
        return {
          ...acc,
          [name]: comparator ? `${comparator}:!${isNull}` : `!${isNull}`,
        };
      }
      if (typeof isOneOf !== "undefined") {
        return {
          ...acc,
          [name]: comparator
            ? `${comparator}:${isOneOf.join(",")}`
            : isOneOf.join(","),
        };
      }

      if (typeof contains !== "undefined") {
        return {
          ...acc,
          [name]: comparator ? `${comparator}:%${contains}%` : `%${contains}%`,
        };
      }

      if (typeof isLikeOneOf !== "undefined") {
        return {
          ...acc,
          [name]: comparator
            ? `${comparator}:${isLikeOneOf.map((v) => `%${v}%`).join(",")}`
            : isLikeOneOf.map((v) => `%${v}%`).join(","),
        };
      }

      if (typeof isGreaterThan !== "undefined") {
        return {
          ...acc,
          [name]: comparator
            ? `${comparator}:>${isGreaterThan}`
            : `>${isGreaterThan}`,
        };
      }

      if (typeof isLessThan !== "undefined") {
        return {
          ...acc,
          [name]: comparator
            ? `${comparator}:<${isLessThan}`
            : `<${isLessThan}`,
        };
      }

      if (typeof isBetween !== "undefined") {
        return {
          ...acc,
          [name]: comparator
            ? `${comparator}:>${isBetween[0]},<${isBetween[1]}`
            : `>${isBetween[0]},<${isBetween[1]}`,
        };
      }

      return acc;
    },
    {}
  );

function toNumberIfPossible(value: string | number): number | string {
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return value as number;
}

export function decodeSearchQuery(
  query: Record<string, string>
): SearchQueryField[] {
  return Object.entries(query).reduce((acc, [name, val]) => {
    const [comparatorStr, valuesStr] = val.includes(":")
      ? val.split(":")
      : ["and", val];

    const comparator = comparatorStr === "and" ? "and" : "or";
    const hasMany = valuesStr.includes(",");
    const values = hasMany ? valuesStr.split(",") : [valuesStr];

    // Is Between
    if (
      values.length === 2 &&
      values[0].startsWith(">") &&
      values[1].startsWith("<")
    ) {
      acc.push({
        name,
        comparator,
        isBetween: [
          toNumberIfPossible(values[0].slice(1)),
          toNumberIfPossible(values[1].slice(1)),
        ],
      });

      // Is Less Than
    } else if (valuesStr.startsWith("<")) {
      const [, value] = valuesStr.split("<");
      acc.push({
        name,
        comparator,
        isLessThan: toNumberIfPossible(value),
      });

      // Is Greater Than
    } else if (valuesStr.startsWith(">")) {
      const [, value] = valuesStr.split(">");
      acc.push({
        name,
        comparator,
        isGreaterThan: toNumberIfPossible(value),
      });

      // Is Like One Of
    } else if (
      values.length > 1 &&
      valuesStr.startsWith("%") &&
      valuesStr.endsWith("%")
    ) {
      acc.push({
        name,
        comparator,
        isLikeOneOf: values.map((v) => v.slice(1, -1)),
      });

      // Contains
    } else if (valuesStr.startsWith("%") && valuesStr.endsWith("%")) {
      acc.push({
        name,
        comparator,
        contains: valuesStr.slice(1, -1),
      });

      // Is One Of
    } else if (values.length > 1) {
      acc.push({
        name,
        comparator,
        isOneOf: values,
      });
      // Is Null
    } else if (values.length === 1 && valuesStr.startsWith("!")) {
      acc.push({
        name,
        comparator,
        isNull: valuesStr === "!true",
      });
      // Is
    } else {
      acc.push({
        name,
        comparator,
        is: toNumberIfPossible(valuesStr),
      });
    }

    return acc;
  }, [] as SearchQueryField[]);
}
