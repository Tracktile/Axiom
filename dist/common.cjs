"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/common/index.ts
var common_exports = {};
__export(common_exports, {
  APIError: () => APIError,
  BadRequestError: () => BadRequestError,
  ErrorType: () => ErrorType,
  ForbiddenError: () => ForbiddenError,
  InternalServerError: () => InternalServerError,
  Model: () => Model,
  NotFoundError: () => NotFoundError,
  Nullable: () => Nullable,
  Procedure: () => Procedure,
  Resource: () => Resource,
  SearchFilterSchema: () => SearchFilterSchema,
  SearchMetadataSchema: () => SearchMetadataSchema,
  SearchParamsSchema: () => SearchParamsSchema,
  SearchResponseSchema: () => SearchResponseSchema,
  T: () => import_typebox.Type,
  TypeCompiler: () => import_compiler.TypeCompiler,
  TypeGuard: () => import_typebox.TypeGuard,
  TypeSystem: () => import_system.TypeSystem,
  UnauthorizedError: () => UnauthorizedError,
  Value: () => import_value.Value,
  assert: () => assert,
  cast: () => cast,
  convertQueryParamKeysFromKabobCase: () => convertQueryParamKeysFromKabobCase,
  convertQueryParamKeysToKabobCase: () => convertQueryParamKeysToKabobCase,
  createModel: () => createModel,
  createProcedure: () => createProcedure,
  createResource: () => createResource,
  decodeSearchQuery: () => decodeSearchQuery,
  encodeSearchQuery: () => encodeSearchQuery,
  getValue: () => getValue,
  isAPIError: () => isAPIError,
  isBadRequestError: () => isBadRequestError,
  isForbiddenError: () => isForbiddenError,
  isInternalServerError: () => isInternalServerError,
  isNotFoundError: () => isNotFoundError,
  isUnauthorizedError: () => isUnauthorizedError,
  noAdditionalProperties: () => noAdditionalProperties,
  noAdditionalPropertiesInSchema: () => noAdditionalPropertiesInSchema,
  noEmptyStringValues: () => noEmptyStringValues,
  shallowSchemaProperties: () => shallowSchemaProperties,
  trueFalseStringsToBoolean: () => trueFalseStringsToBoolean,
  undefinedToNull: () => undefinedToNull,
  withDatesAsDateTimeStrings: () => withDatesAsDateTimeStrings,
  withDefaultsForStringFormats: () => withDefaultsForStringFormats,
  withNoEnumValues: () => withNoEnumValues,
  withNoStringFormats: () => withNoStringFormats
});
module.exports = __toCommonJS(common_exports);

// src/common/typebox.ts
var typebox_exports = {};
__export(typebox_exports, {
  T: () => import_typebox.Type,
  TypeCompiler: () => import_compiler.TypeCompiler,
  TypeGuard: () => import_typebox.TypeGuard,
  TypeSystem: () => import_system.TypeSystem,
  Value: () => import_value.Value
});
__reExport(typebox_exports, require("@sinclair/typebox"));
var import_typebox = require("@sinclair/typebox");
var import_value = require("@sinclair/typebox/value");
var import_compiler = require("@sinclair/typebox/compiler");
var import_system = require("@sinclair/typebox/system");

// src/common/index.ts
__reExport(common_exports, typebox_exports, module.exports);

// src/common/model.ts
var Model = class {
  name;
  resource;
  idKey;
  schemas;
  transformer;
  sortableBy;
  _unstable_offlineModel;
  infiniteSearch;
  constructor(options) {
    this.name = options.name;
    this.resource = options.resource;
    this.idKey = options.idKey;
    this.schemas = {
      model: options.model,
      create: options.create ?? options.model,
      update: options.update ?? options.model,
      del: options.del ?? import_typebox.Type.Object({}),
      path: options.path ?? import_typebox.Type.Object({}),
      query: options.query ?? import_typebox.Type.Object({})
    };
    this.transformer = options.transformer;
    this.sortableBy = options.sortableBy || options.model;
    this._unstable_offlineModel = options._unstable_offlineModel ?? false;
    this.infiniteSearch = options.infiniteSearch ? {
      enabled: options.infiniteSearch.enabled,
      defaultLimit: options.infiniteSearch.defaultLimit ?? 50
    } : void 0;
  }
  getSearchResponseType() {
    return import_typebox.Type.Object({
      results: import_typebox.Type.Array(this.schemas.model),
      nextCursor: import_typebox.Type.Optional(import_typebox.Type.String()),
      total: import_typebox.Type.Number(),
      metadata: import_typebox.Type.Object({
        currentResults: import_typebox.Type.Number(),
        historicalResults: import_typebox.Type.Number(),
        timePeriodCovered: import_typebox.Type.Tuple([import_typebox.Type.String(), import_typebox.Type.String()])
      })
    });
  }
  getSearchParamsType() {
    return import_typebox.Type.Object({
      cursor: import_typebox.Type.Optional(import_typebox.Type.String()),
      limit: import_typebox.Type.Optional(import_typebox.Type.Number()),
      search: import_typebox.Type.Optional(import_typebox.Type.String()),
      filters: import_typebox.Type.Optional(
        import_typebox.Type.Array(
          import_typebox.Type.Object({
            field: import_typebox.Type.String(),
            operator: import_typebox.Type.Union([
              import_typebox.Type.Literal("eq"),
              import_typebox.Type.Literal("contains"),
              import_typebox.Type.Literal("gt"),
              import_typebox.Type.Literal("lt"),
              import_typebox.Type.Literal("between")
            ]),
            value: import_typebox.Type.Union([
              import_typebox.Type.String(),
              import_typebox.Type.Number(),
              import_typebox.Type.Boolean(),
              import_typebox.Type.Array(import_typebox.Type.Union([import_typebox.Type.String(), import_typebox.Type.Number()]))
            ])
          })
        )
      ),
      sort: import_typebox.Type.Optional(
        import_typebox.Type.Object({
          field: import_typebox.Type.String(),
          direction: import_typebox.Type.Union([import_typebox.Type.Literal("asc"), import_typebox.Type.Literal("desc")])
        })
      )
    });
  }
};
function createModel(options) {
  return new Model(options);
}

// src/common/procedure.ts
var Procedure = class {
  name;
  resource;
  method = "GET";
  params;
  query;
  result;
  constructor(options) {
    this.name = options.name;
    this.resource = options.resource;
    this.params = options.params;
    this.result = options.result;
    this.query = options.query ?? import_typebox.Type.Object({});
    this.method = options.method || "GET";
  }
};
function createProcedure(options) {
  return new Procedure(options);
}

// src/common/utils.ts
function convertQueryParamKeysToKabobCase(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [key.replace(/0/g, "."), val])
  );
}
function convertQueryParamKeysFromKabobCase(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [key.replace(/,/g, "-"), val])
  );
}
function getValue(data, path, defaultValue) {
  const value = path.split(/[.[\]]/).filter(Boolean).reduce(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (value2, key) => value2?.[key],
    data
  );
  return value !== void 0 ? value : defaultValue;
}
function Nullable(schema) {
  return typebox_exports.Type.Unsafe({ ...schema, nullable: true });
}
function noAdditionalPropertiesInSchema(schema) {
  if (import_typebox.TypeGuard.IsArray(schema)) {
    return { ...schema, items: noAdditionalPropertiesInSchema(schema.items) };
  }
  if (import_typebox.TypeGuard.IsObject(schema)) {
    return {
      ...schema,
      additionalProperties: false,
      properties: Object.fromEntries(
        Object.entries(schema.properties).map(([key, value]) => [
          key,
          noAdditionalPropertiesInSchema(value)
        ])
      )
    };
  }
  return schema;
}
function withDefaultsForStringFormats(schema) {
  if (import_typebox.TypeGuard.IsArray(schema)) {
    return { ...schema, items: withDefaultsForStringFormats(schema.items) };
  }
  if (import_typebox.TypeGuard.IsObject(schema)) {
    return {
      ...schema,
      properties: Object.fromEntries(
        Object.entries(schema.properties).map(([key, value]) => [
          key,
          withDefaultsForStringFormats(value)
        ])
      )
    };
  }
  if (import_typebox.TypeGuard.IsString(schema) && typeof schema.format !== "undefined") {
    return {
      ...schema,
      default: ""
    };
  }
  return schema;
}
function withNoStringFormats(schema) {
  if (import_typebox.TypeGuard.IsArray(schema)) {
    return { ...schema, items: withNoStringFormats(schema.items) };
  }
  if (import_typebox.TypeGuard.IsObject(schema)) {
    return {
      ...schema,
      properties: Object.fromEntries(
        Object.entries(schema.properties).map(([key, value]) => [
          key,
          withNoStringFormats(value)
        ])
      )
    };
  }
  if (import_typebox.TypeGuard.IsString(schema) && typeof schema.format !== "undefined") {
    return {
      ...schema,
      format: void 0
    };
  }
  return schema;
}
function withNoEnumValues(schema) {
  if (import_typebox.TypeGuard.IsArray(schema)) {
    return { ...schema, items: withNoEnumValues(schema.items) };
  }
  if (import_typebox.TypeGuard.IsObject(schema)) {
    return {
      ...schema,
      properties: Object.fromEntries(
        Object.entries(schema.properties).filter(([, value]) => {
          return !import_typebox.TypeGuard.IsUnion(value);
        }).map(([key, value]) => [key, withNoEnumValues(value)])
      )
    };
  }
  return schema;
}
function withDatesAsDateTimeStrings(schema) {
  if (import_typebox.TypeGuard.IsArray(schema)) {
    return { ...schema, items: withDatesAsDateTimeStrings(schema.items) };
  }
  if (import_typebox.TypeGuard.IsObject(schema)) {
    return {
      ...schema,
      properties: Object.fromEntries(
        Object.entries(schema.properties).map(([key, value]) => [
          key,
          withDatesAsDateTimeStrings(value)
        ])
      )
    };
  }
  if (import_typebox.TypeGuard.IsDate(schema)) {
    return {
      ...schema,
      type: "string",
      format: "date-time"
    };
  }
  return schema;
}
function noEmptyStringValues(obj) {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    if (val !== "") {
      return { ...acc, [key]: val };
    }
    return acc;
  }, {});
}
function noAdditionalProperties(schema, input) {
  if (import_typebox.TypeGuard.IsArray(schema) && Array.isArray(input)) {
    return input.map(
      (item) => noAdditionalProperties(schema.items, item)
    );
  }
  if (import_typebox.TypeGuard.IsObject(schema) && typeof input === "object" && input !== null) {
    const prunedInput = {};
    for (const [key, value] of Object.entries(input)) {
      if (key in schema.properties) {
        prunedInput[key] = noAdditionalProperties(
          schema.properties[key],
          value
        );
      }
    }
    return prunedInput;
  }
  return input;
}
function shallowSchemaProperties(schema) {
  return {
    ...schema,
    properties: Object.fromEntries(
      Object.entries(schema.properties).filter(
        ([, prop]) => !import_typebox.TypeGuard.IsArray(prop) && !import_typebox.TypeGuard.IsObject(prop)
      )
    )
  };
}
function undefinedToNull(input) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      value === void 0 ? null : value
    ])
  );
}
function trueFalseStringsToBoolean(input) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      value === "true" ? true : value === "false" ? false : value
    ])
  );
}
function cast(schema, value) {
  return import_value.Value.Cast(schema, value);
}

// src/common/errors.ts
var import_ts_custom_error = require("ts-custom-error");
var ErrorType = /* @__PURE__ */ ((ErrorType2) => {
  ErrorType2["BadRequest"] = "BadRequest";
  ErrorType2["Unauthorized"] = "Unauthorized";
  ErrorType2["Forbidden"] = "Forbidden";
  ErrorType2["NotFound"] = "NotFound";
  ErrorType2["InternalServerError"] = "InternalServerError";
  return ErrorType2;
})(ErrorType || {});
var APIError = class extends import_ts_custom_error.CustomError {
  type;
  status;
  errors;
  constructor(status, message, errors = {}) {
    super(message);
    this.type = "InternalServerError" /* InternalServerError */;
    this.status = status;
    this.errors = errors;
  }
};
function isAPIError(error) {
  return !!error && typeof error === "object" && "status" in error && typeof error.status === "number";
}
var BadRequestError = class extends APIError {
  fields;
  constructor(message, fieldErrors) {
    super(400, message || "Bad Request");
    this.type = "BadRequest" /* BadRequest */;
    this.fields = fieldErrors || {};
  }
};
function isBadRequestError(error) {
  return error.type === "BadRequest" /* BadRequest */ && error.status === 400;
}
var UnauthorizedError = class extends APIError {
  constructor(message, errors) {
    super(401, message || "Unauthorized", errors);
    this.type = "Unauthorized" /* Unauthorized */;
  }
};
function isUnauthorizedError(error) {
  return error.type === "Unauthorized" /* Unauthorized */ && error.status === 401;
}
var ForbiddenError = class extends APIError {
  constructor(message, errors) {
    super(403, message || "Forbidden", errors);
    this.type = "Forbidden" /* Forbidden */;
  }
};
function isForbiddenError(error) {
  return error.type === "Forbidden" /* Forbidden */ && error.status === 403;
}
var NotFoundError = class extends APIError {
  constructor(message, errors) {
    super(404, message || "Not Found", errors);
    this.type = "NotFound" /* NotFound */;
  }
};
function isNotFoundError(error) {
  return error.type === "NotFound" /* NotFound */ && error.status === 404;
}
var InternalServerError = class extends APIError {
  constructor(message, errors) {
    super(500, message || "Internal Server Error", errors);
    this.type = "InternalServerError" /* InternalServerError */;
  }
};
function isInternalServerError(error) {
  return error.type === "InternalServerError" /* InternalServerError */ && error.status === 500;
}
var assert = (condition, message, error = BadRequestError) => {
  if (!condition) {
    throw new error(message);
  }
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  APIError: () => APIError,
  BadRequestError: () => BadRequestError,
  ErrorType: () => ErrorType,
  ForbiddenError: () => ForbiddenError,
  InternalServerError: () => InternalServerError,
  Model: () => Model,
  NotFoundError: () => NotFoundError,
  Nullable: () => Nullable,
  Procedure: () => Procedure,
  Resource: () => Resource,
  SearchFilterSchema: () => SearchFilterSchema,
  SearchMetadataSchema: () => SearchMetadataSchema,
  SearchParamsSchema: () => SearchParamsSchema,
  SearchResponseSchema: () => SearchResponseSchema,
  T: () => import_typebox.Type,
  TypeCompiler: () => import_compiler.TypeCompiler,
  TypeGuard: () => import_typebox.TypeGuard,
  TypeSystem: () => import_system.TypeSystem,
  UnauthorizedError: () => UnauthorizedError,
  Value: () => import_value.Value,
  assert: () => assert,
  cast: () => cast,
  convertQueryParamKeysFromKabobCase: () => convertQueryParamKeysFromKabobCase,
  convertQueryParamKeysToKabobCase: () => convertQueryParamKeysToKabobCase,
  createModel: () => createModel,
  createProcedure: () => createProcedure,
  createResource: () => createResource,
  decodeSearchQuery: () => decodeSearchQuery,
  encodeSearchQuery: () => encodeSearchQuery,
  getValue: () => getValue,
  isAPIError: () => isAPIError,
  isBadRequestError: () => isBadRequestError,
  isForbiddenError: () => isForbiddenError,
  isInternalServerError: () => isInternalServerError,
  isNotFoundError: () => isNotFoundError,
  isUnauthorizedError: () => isUnauthorizedError,
  noAdditionalProperties: () => noAdditionalProperties,
  noAdditionalPropertiesInSchema: () => noAdditionalPropertiesInSchema,
  noEmptyStringValues: () => noEmptyStringValues,
  shallowSchemaProperties: () => shallowSchemaProperties,
  trueFalseStringsToBoolean: () => trueFalseStringsToBoolean,
  undefinedToNull: () => undefinedToNull,
  withDatesAsDateTimeStrings: () => withDatesAsDateTimeStrings,
  withDefaultsForStringFormats: () => withDefaultsForStringFormats,
  withNoEnumValues: () => withNoEnumValues,
  withNoStringFormats: () => withNoStringFormats
});
__reExport(src_exports, common_exports);

// src/common/search.ts
var SearchMetadataSchema = import_typebox.Type.Object({
  currentResults: import_typebox.Type.Number(),
  historicalResults: import_typebox.Type.Number(),
  timePeriodCovered: import_typebox.Type.Tuple([import_typebox.Type.String(), import_typebox.Type.String()])
});
var SearchResponseSchema = import_typebox.Type.Object({
  results: import_typebox.Type.Array(import_typebox.Type.Any()),
  nextCursor: import_typebox.Type.Optional(import_typebox.Type.String()),
  total: import_typebox.Type.Number(),
  metadata: SearchMetadataSchema
});
var SearchFilterSchema = import_typebox.Type.Object({
  field: import_typebox.Type.String(),
  operator: import_typebox.Type.Union([
    import_typebox.Type.Literal("eq"),
    import_typebox.Type.Literal("contains"),
    import_typebox.Type.Literal("gt"),
    import_typebox.Type.Literal("lt"),
    import_typebox.Type.Literal("between")
  ]),
  value: import_typebox.Type.Union([
    import_typebox.Type.String(),
    import_typebox.Type.Number(),
    import_typebox.Type.Boolean(),
    import_typebox.Type.Array(import_typebox.Type.Union([import_typebox.Type.String(), import_typebox.Type.Number()]))
  ])
});
var SearchParamsSchema = import_typebox.Type.Object({
  cursor: import_typebox.Type.Optional(import_typebox.Type.String()),
  limit: import_typebox.Type.Number(),
  search: import_typebox.Type.Optional(import_typebox.Type.String()),
  sort: import_typebox.Type.Optional(
    import_typebox.Type.Object({
      field: import_typebox.Type.String(),
      direction: import_typebox.Type.Union([import_typebox.Type.Literal("asc"), import_typebox.Type.Literal("desc")])
    })
  )
});
var encodeSearchQuery = (fields) => fields.reduce(
  (acc, {
    name,
    comparator,
    is,
    isNull,
    isOneOf,
    isLikeOneOf,
    contains,
    isGreaterThan,
    isLessThan,
    isBetween
  }) => {
    if (typeof is !== "undefined") {
      return {
        ...acc,
        [name]: comparator ? `${comparator}:${is}` : is
      };
    }
    if (typeof isNull !== "undefined") {
      return {
        ...acc,
        [name]: comparator ? `${comparator}:!${isNull}` : `!${isNull}`
      };
    }
    if (typeof isOneOf !== "undefined") {
      return {
        ...acc,
        [name]: comparator ? `${comparator}:${isOneOf.join(",")}` : isOneOf.join(",")
      };
    }
    if (typeof contains !== "undefined") {
      return {
        ...acc,
        [name]: comparator ? `${comparator}:%${contains}%` : `%${contains}%`
      };
    }
    if (typeof isLikeOneOf !== "undefined") {
      return {
        ...acc,
        [name]: comparator ? `${comparator}:${isLikeOneOf.map((v) => `%${v}%`).join(",")}` : isLikeOneOf.map((v) => `%${v}%`).join(",")
      };
    }
    if (typeof isGreaterThan !== "undefined") {
      return {
        ...acc,
        [name]: comparator ? `${comparator}:>${isGreaterThan}` : `>${isGreaterThan}`
      };
    }
    if (typeof isLessThan !== "undefined") {
      return {
        ...acc,
        [name]: comparator ? `${comparator}:<${isLessThan}` : `<${isLessThan}`
      };
    }
    if (typeof isBetween !== "undefined") {
      return {
        ...acc,
        [name]: comparator ? `${comparator}:>${isBetween[0]},<${isBetween[1]}` : `>${isBetween[0]},<${isBetween[1]}`
      };
    }
    return acc;
  },
  {}
);
function toNumberIfPossible(value) {
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return value;
}
function decodeSearchQuery(query) {
  return Object.entries(query).reduce((acc, [name, val]) => {
    const [comparatorStr, valuesStr] = val.includes(":") ? val.split(":") : ["and", val];
    const comparator = comparatorStr === "and" ? "and" : "or";
    const hasMany = valuesStr.includes(",");
    const values = hasMany ? valuesStr.split(",") : [valuesStr];
    if (values.length === 2 && values[0].startsWith(">") && values[1].startsWith("<")) {
      acc.push({
        name,
        comparator,
        isBetween: [
          toNumberIfPossible(values[0].slice(1)),
          toNumberIfPossible(values[1].slice(1))
        ]
      });
    } else if (valuesStr.startsWith("<")) {
      const [, value] = valuesStr.split("<");
      acc.push({
        name,
        comparator,
        isLessThan: toNumberIfPossible(value)
      });
    } else if (valuesStr.startsWith(">")) {
      const [, value] = valuesStr.split(">");
      acc.push({
        name,
        comparator,
        isGreaterThan: toNumberIfPossible(value)
      });
    } else if (values.length > 1 && valuesStr.startsWith("%") && valuesStr.endsWith("%")) {
      acc.push({
        name,
        comparator,
        isLikeOneOf: values.map((v) => v.slice(1, -1))
      });
    } else if (valuesStr.startsWith("%") && valuesStr.endsWith("%")) {
      acc.push({
        name,
        comparator,
        contains: valuesStr.slice(1, -1)
      });
    } else if (values.length > 1) {
      acc.push({
        name,
        comparator,
        isOneOf: values
      });
    } else if (values.length === 1 && valuesStr.startsWith("!")) {
      acc.push({
        name,
        comparator,
        isNull: valuesStr === "!true"
      });
    } else {
      acc.push({
        name,
        comparator,
        is: toNumberIfPossible(valuesStr)
      });
    }
    return acc;
  }, []);
}

// src/common/resource.ts
var Resource = class {
  name;
  resource;
  schema;
  params;
  constructor(options) {
    this.name = options.name;
    this.resource = options.resource;
    this.schema = options.schema;
    this.params = options.params;
  }
};
function createResource(options) {
  return new Resource(options);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  APIError,
  BadRequestError,
  ErrorType,
  ForbiddenError,
  InternalServerError,
  Model,
  NotFoundError,
  Nullable,
  Procedure,
  Resource,
  SearchFilterSchema,
  SearchMetadataSchema,
  SearchParamsSchema,
  SearchResponseSchema,
  T,
  TypeCompiler,
  TypeGuard,
  TypeSystem,
  UnauthorizedError,
  Value,
  assert,
  cast,
  convertQueryParamKeysFromKabobCase,
  convertQueryParamKeysToKabobCase,
  createModel,
  createProcedure,
  createResource,
  decodeSearchQuery,
  encodeSearchQuery,
  getValue,
  isAPIError,
  isBadRequestError,
  isForbiddenError,
  isInternalServerError,
  isNotFoundError,
  isUnauthorizedError,
  noAdditionalProperties,
  noAdditionalPropertiesInSchema,
  noEmptyStringValues,
  shallowSchemaProperties,
  trueFalseStringsToBoolean,
  undefinedToNull,
  withDatesAsDateTimeStrings,
  withDefaultsForStringFormats,
  withNoEnumValues,
  withNoStringFormats
});
//# sourceMappingURL=common.cjs.map