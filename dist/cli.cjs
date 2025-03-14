#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/cli/index.ts
var import_typebox4 = require("@sinclair/typebox");
var import_value2 = require("@sinclair/typebox/value");
var import_fs = __toESM(require("fs"), 1);
var import_load_config_file = __toESM(require("load-config-file"), 1);
var import_path = __toESM(require("path"), 1);
var import_ts_command_line_args = require("ts-command-line-args");

// src/server/service.ts
var import_router = __toESM(require("@koa/router"), 1);
var import_koa = __toESM(require("koa"), 1);
var import_koa_bodyparser = __toESM(require("koa-bodyparser"), 1);
var import_koa_qs = __toESM(require("koa-qs"), 1);
var import_object_sizeof = __toESM(require("object-sizeof"), 1);
var import_pretty_bytes = __toESM(require("pretty-bytes"), 1);

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
__reExport(common_exports, typebox_exports);

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
function getValue(data, path2, defaultValue) {
  const value = path2.split(/[.[\]]/).filter(Boolean).reduce(
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

// src/server/service.ts
var DEFAULT_SERVICE_CONFIGURATION = {
  cors: {}
};
function isService(service) {
  if (typeof service !== "object" || service === null) {
    return false;
  }
  return "title" in service && typeof service.title === "string" && "description" in service && typeof service.description === "string" && "tags" in service && Array.isArray(service.tags) && "prefix" in service && typeof service.prefix === "string";
}

// src/cli/generate.ts
var import_reflect_metadata = require("reflect-metadata");
var import_json_schema_to_openapi_schema = __toESM(require("@openapi-contrib/json-schema-to-openapi-schema"), 1);
var import_typebox3 = require("@sinclair/typebox");
var import_debug = require("debug");
var import_kebab_case = __toESM(require("kebab-case"), 1);
var oa = __toESM(require("openapi3-ts"), 1);

// src/server/combined-service.ts
var DEFAULT_COMBINED_SERVICE_CONFIGURATION = {
  ...DEFAULT_SERVICE_CONFIGURATION,
  title: "",
  description: "",
  tags: [],
  contact: {
    name: "",
    email: "",
    url: ""
  },
  license: {
    name: "",
    url: ""
  }
};
function isCombinedService(service) {
  return "children" in service && Array.isArray(service.children) && service.children.length > 0;
}

// src/cli/generate.ts
var log = (0, import_debug.debug)("axiom:cli:generate");
async function convertToOpenAPI(schema) {
  const converted = (0, import_json_schema_to_openapi_schema.default)(schema);
  return converted;
}
var formatPath = (path2) => {
  const converted = path2.split("/").map((part) => {
    if (part.includes(":")) {
      return `{${part.replace(":", "")}}`;
    }
    return part;
  }).join("/");
  if (converted === "/") {
    return converted;
  }
  return converted.endsWith("/") ? converted.slice(0, converted.length - 1) : converted;
};
var kebab = (str) => {
  const noSpaces = str.replace(/\s/g, "");
  return (0, import_kebab_case.default)(noSpaces).substring(1)?.toLocaleLowerCase() ?? "";
};
var DEFAULT_GENERATE_OPTIONS = {
  format: "yaml"
};
async function generate(target, {
  format = "yaml",
  internal = false,
  sections = []
} = DEFAULT_GENERATE_OPTIONS) {
  log("Generating OpenAPI spec from service", target);
  const spec = oa.oas30.OpenApiBuilder.create().addTitle(target.title).addDescription(target.description).addVersion(target.version).addSecurityScheme("JWT", {
    bearerFormat: "JWT",
    type: "http",
    scheme: "bearer",
    description: "The JWT received by authenticating to the /auth/login endpoint."
  }).addResponse("400", {
    description: "Bad Request Error",
    content: {
      "application/json": {
        schema: {
          properties: {
            status: { type: "number" },
            message: { type: "string" }
          },
          example: {
            status: 400,
            message: "A helpful error message indicating what was invalid about your request"
          }
        }
      }
    }
  }).addResponse("401", {
    description: "Unauthorized",
    content: {
      "application/json": {
        schema: {
          properties: {
            status: { type: "number" },
            message: { type: "string" }
          },
          example: {
            status: 401,
            message: "You must be authenticated to access this resource."
          }
        }
      }
    }
  }).addResponse("403", {
    description: "Forbidden",
    content: {
      "application/json": {
        schema: {
          properties: {
            status: { type: "number" },
            message: { type: "string" }
          },
          example: {
            status: 403,
            message: "Current user does not have permissions to access this resource."
          }
        }
      }
    }
  }).addResponse("500", {
    description: "Internal Server Error",
    content: {
      "application/json": {
        schema: {
          properties: {
            status: { type: "number" },
            message: { type: "string" }
          },
          example: {
            status: 500,
            message: "Something has gone horribly wrong."
          }
        }
      }
    }
  });
  if (target.license) {
    spec.addLicense(target.license);
  }
  for (const server of target.servers) {
    spec.addServer(server);
  }
  if (isCombinedService(target)) {
    log("Input is a combined service - adding tags for each service");
    if (target.logo) {
      spec.rootDoc.info["x-logo"] = {
        url: target.logo,
        altText: target.title
      };
    }
    target.children.filter((service) => !service.internal || internal).forEach((service) => {
      log(`Adding for service ${service.title}`);
      spec.addTag({
        name: service.title,
        description: service.description
      });
      service.tags = [service.title];
    });
  }
  if (sections.length > 0) {
    log("Adding x-tagGroups for each section");
    spec.rootDoc["x-tagGroups"] = sections.map((section) => ({
      name: section.title,
      tags: section.tags
    }));
  }
  const operationsByPath = {};
  const services = isCombinedService(target) ? target.children : [target];
  log(`Found ${services.length} services`);
  services.filter((service) => !service.internal || internal).forEach((service) => {
    log(`Adding controllers for service ${service.title}`);
    service.controllers.filter((controller) => !controller.internal || internal).forEach((controller) => {
      const ops = controller.getOperations();
      log(`Found ${ops.length} operations for controller`);
      ops.forEach(([op]) => {
        log(
          `Operation: ${op.method.toUpperCase()} ${controller.prefix}${op.path}: ${op.name}`
        );
        const path2 = `${["", "/"].includes(service.prefix) ? "" : service.prefix}${controller.prefix}${op.path}`;
        if (!Array.isArray(operationsByPath[path2])) {
          operationsByPath[path2] = [];
        }
        operationsByPath[path2].push({
          ...op,
          tags: [
            .../* @__PURE__ */ new Set([...service.tags, ...controller.tags, ...op.tags])
          ],
          controller,
          service
        });
      });
    });
  });
  log("Iterating over operations by path to generate path parameters");
  for (const path2 of Object.keys(operationsByPath)) {
    log(`Generating path parameters for path ${path2}`);
    let pathObj = {};
    const operations = operationsByPath[path2].filter((op) => {
      return !op.internal && !op.controller.internal || internal;
    });
    log(`Found ${operations.length} operations for path ${path2}`);
    const [first] = operations;
    if (first) {
      log(`First operation: ${first.name} ${first.method} ${first.path}`);
      pathObj.parameters = Object.keys(first.params.properties).map((key) => ({
        name: key,
        in: "path",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        required: first.params.required.includes(key),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        schema: { type: "string", format: first.params.properties[key].format },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        description: first.params.properties[key].description,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        example: first.params.properties[key].example,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        examples: first.params.properties[key].examples
      }));
    }
    log(`Path parameters: ${JSON.stringify(pathObj.parameters)}`);
    for (const op of operations) {
      log(`Generating operation ${op.name} ${op.method} ${op.path}`);
      if (!import_typebox3.TypeGuard.IsObject(op.params)) {
        throw new Error(
          `Invalid parameters provided to route, must be T.Object. ${op.name} ${op.method} ${op.path}`
        );
      }
      if (!import_typebox3.TypeGuard.IsObject(op.query)) {
        throw new Error(
          `Invalid query provided to route, must be T.Object. ${op.name} ${op.method} ${op.path}`
        );
      }
      log(`req`, JSON.stringify(op.req, null, ""));
      log(`res`, JSON.stringify(op.res, null, ""));
      pathObj = {
        ...pathObj,
        [op.method]: {
          operationId: kebab(op.name),
          summary: op.summary ?? "No Summary",
          description: op.description ? op.description : "No description",
          tags: op.tags,
          ...["post", "put"].includes(op.method) ? {
            requestBody: {
              content: {
                "application/json": {
                  schema: await convertToOpenAPI(
                    withDatesAsDateTimeStrings(op.req)
                  )
                }
              }
            }
          } : {},
          parameters: Object.keys(op.query.properties).map((prop) => ({
            name: prop,
            schema: {
              type: "string",
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              format: op.query.properties[prop].format
            },
            in: "query",
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            description: op.query.properties[prop].description
          })),
          security: op.auth ? [{ JWT: [] }] : [],
          responses: {
            200: {
              description: op.res.description ?? "Success",
              content: {
                "application/json": {
                  schema: await convertToOpenAPI(
                    withDatesAsDateTimeStrings(op.res)
                  )
                }
              }
            },
            400: { $ref: "#/components/responses/400" },
            401: { $ref: "#/components/responses/401" },
            403: { $ref: "#/components/responses/403" },
            500: { $ref: "#/components/responses/500" }
          }
        }
      };
    }
    log(`Adding path ${path2}`, pathObj);
    spec.addPath(formatPath(path2), pathObj);
  }
  if (format === "yaml") {
    return spec.getSpecAsYaml();
  }
  return spec.getSpecAsJson();
}

// src/cli/index.ts
import_load_config_file.default.register("json", (text) => JSON.parse(text));
var AxiomCliConfig = import_typebox4.Type.Object({
  entry: import_typebox4.Type.String({ default: "index.ts" }),
  output: import_typebox4.Type.String({ default: "api.yaml" }),
  internal: import_typebox4.Type.Boolean({ default: false }),
  format: import_typebox4.Type.Union([import_typebox4.Type.Literal("json"), import_typebox4.Type.Literal("yaml")], { default: "yaml" }),
  sections: import_typebox4.Type.Optional(
    import_typebox4.Type.Array(
      import_typebox4.Type.Object({
        title: import_typebox4.Type.String(),
        tags: import_typebox4.Type.Array(import_typebox4.Type.String())
      })
    )
  )
});
var AxiomCliArgs = import_typebox4.Type.Object({
  config: import_typebox4.Type.Optional(import_typebox4.Type.String()),
  help: import_typebox4.Type.Optional(import_typebox4.Type.Boolean())
});
var fatal = (message) => {
  console.error(`[X] ${message}`);
  process.exit(1);
};
var info = (...args) => {
  console.info("[*]", ...args);
};
var processArgs = () => {
  try {
    const args = (0, import_ts_command_line_args.parse)(
      {
        config: {
          type: String,
          optional: true,
          description: "Path to an axiom.config.json file.",
          defaultValue: "axiom.config.json"
        },
        help: {
          type: Boolean,
          optional: true,
          alias: "h",
          description: "Displays this useful screen!"
        }
      },
      {
        helpArg: "help",
        headerContentSections: [
          {
            header: "Axiom",
            content: "A batteries included Typescript API framework, but like.. watch batteries."
          }
        ]
      }
    );
    return args;
  } catch (err) {
    if (err instanceof Error) {
      return fatal(err.message);
    }
    return fatal("Error encountered while process arguments.");
  }
};
var recurseDefaultExports = (imported) => {
  if (imported.default) {
    return recurseDefaultExports(imported.default);
  }
  return imported;
};
async function loadEntry(entry) {
  const imported = await import(entry);
  const service = recurseDefaultExports(imported);
  return service;
}
function getConfig(configPath) {
  try {
    const config = import_value2.Value.Cast(AxiomCliConfig, {});
    config.entry = import_path.default.resolve(config.entry);
    config.output = import_path.default.resolve(config.output);
    return config;
  } catch (err) {
    if (err instanceof Error) {
      return fatal(
        `Unable to resolve configuration: ${configPath ?? "axiom.config"}: ${err.message}`
      );
    }
    return fatal("Unable to resolve configuration.");
  }
}
async function main() {
  const args = processArgs();
  const config = getConfig(args.config);
  const service = await loadEntry(config.entry);
  if (!isService(service)) {
    return fatal("Entry file does not export a valid service.");
  }
  const content = await generate(service, config);
  import_fs.default.writeFileSync(import_path.default.resolve(config.output), content, { encoding: "utf8" });
  info("Specification written to:", import_path.default.resolve(config.output));
}
main();
//# sourceMappingURL=cli.cjs.map