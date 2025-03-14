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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var client_exports = {};
__export(client_exports, {
  ReactModel: () => ReactModel,
  ReactProcedure: () => ReactProcedure,
  ReactResource: () => ReactResource,
  buildResourcePath: () => buildResourcePath,
  createApi: () => createApi,
  createApiProvider: () => createApiProvider,
  createCallRequestFn: () => createCallRequestFn,
  createCreateRequestFn: () => createCreateRequestFn,
  createGetRequestFn: () => createGetRequestFn,
  createRemoveRequestFn: () => createRemoveRequestFn,
  createSearchRequestFn: () => createSearchRequestFn,
  createUpdateRequestFn: () => createUpdateRequestFn,
  createUseApiHook: () => createUseApiHook,
  paramsForQuery: () => paramsForQuery,
  request: () => request
});
module.exports = __toCommonJS(client_exports);

// src/client/model.ts
var import_react_query = require("@tanstack/react-query");
var import_lodash = require("lodash");
var import_react = require("react");

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

// src/client/request.ts
var import_debug = __toESM(require("debug"), 1);
var import_qs = require("qs");
var log = (0, import_debug.default)("axiom:request");
function paramsForQuery(url, params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([key]) => !url.includes(`:${key}`))
  );
}
function buildResourcePath(baseUrl, resource, params = {}) {
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.substr(0, baseUrl.length - 1) : baseUrl;
  const cleanResource = resource.startsWith("/") ? resource.substr(1) : resource;
  const url = `${cleanBaseUrl}/${cleanResource}`;
  const urlWithParams = Object.entries(params).reduce((acc, [key, val]) => {
    if (typeof val !== "undefined" && typeof val !== "object") {
      return acc.replace(`:${key}`, val.toString());
    }
    return acc;
  }, url);
  return urlWithParams;
}
async function request(url, {
  method = "get",
  headers = {},
  query = {},
  body,
  token
} = {}) {
  const cleanedQuery = Object.entries(query).reduce((acc, [key, val]) => {
    if (!val) {
      return acc;
    }
    return { ...acc, [key]: val };
  }, {});
  const queryString = (0, import_qs.stringify)(cleanedQuery);
  const uri = `${url}${queryString ? `?${queryString}` : ""}`;
  const requestHeaders = {
    "Content-Type": "application/json",
    ...token ? { Authorization: `Bearer ${token}` } : {},
    ...headers
  };
  log(`${method} ${uri}`, { body, headers: requestHeaders, token });
  const resp = await fetch(uri, {
    method,
    headers: requestHeaders,
    body: ["post", "put"].includes(method.toLowerCase()) ? JSON.stringify(body) : void 0
  });
  if (!resp.ok) {
    const error = await resp.json();
    if (isBadRequestError(error)) {
      throw new BadRequestError(error.message, error.fields);
    } else if (isNotFoundError(error)) {
      throw new NotFoundError(error.message);
    } else if (isUnauthorizedError(error)) {
      throw new UnauthorizedError(error.message);
    } else if (isInternalServerError(error)) {
      throw new InternalServerError(error.message);
    } else {
      throw new InternalServerError("An unknown error occurred");
    }
  }
  log(`${method} ${uri} - ${resp.status} ${resp.statusText}`);
  const responseHeaders = {};
  for (const pair of resp.headers.entries()) {
    const [name, value] = pair;
    responseHeaders[name.toLowerCase()] = value;
  }
  const [offset, limit, total, next, prev] = [
    responseHeaders["X-Pagination-Offset".toLowerCase()],
    responseHeaders["X-Pagination-Limit".toLowerCase()],
    responseHeaders["X-Pagination-Total".toLowerCase()],
    responseHeaders["X-Pagination-Next".toLowerCase()],
    responseHeaders["X-Pagination-Prev".toLowerCase()]
  ];
  const respBody = await resp.json();
  return [
    respBody,
    {
      offset: parseInt(offset, 10),
      limit: parseInt(limit, 10),
      total: parseInt(total, 10),
      next,
      prev
    }
  ];
}
function createSearchRequestFn({
  resourcePath,
  token,
  headers,
  ...options
}) {
  return async function search({
    offset = 0,
    limit = 999,
    orderBy,
    knownCursors,
    next: nextParam,
    prev: prevParam,
    ...query
  } = {}) {
    const [results, { total, next, prev }] = await request(
      resourcePath,
      {
        method: "get",
        query: convertQueryParamKeysToKabobCase(query),
        token: token.current,
        headers: {
          "X-Pagination-Offset": offset.toString(),
          "X-Pagination-Limit": limit.toString(),
          ...knownCursors ? { "X-Pagination-KnownCursors": knownCursors } : {},
          ...nextParam ? { "X-Pagination-Next": nextParam } : {},
          ...prevParam ? { "X-Pagination-Prev": prevParam } : {},
          ...orderBy ? { "X-Pagination-OrderBy": orderBy } : {},
          ...headers
        },
        ...options
      }
    );
    return { results, total, offset, limit, orderBy, next, prev };
  };
}
function createCallRequestFn({
  resourcePath,
  token,
  ...options
}) {
  return async function call(params) {
    const [resp] = await request(resourcePath, {
      token: token.current,
      query: params,
      ...options
    });
    return resp;
  };
}
function createGetRequestFn({
  resourcePath,
  token,
  ...options
}) {
  return async function get2(id, query = {}) {
    const [resp] = await request(`${resourcePath}/${id}`, {
      method: "get",
      token: token.current,
      query: convertQueryParamKeysToKabobCase(query),
      ...options
    });
    return resp;
  };
}
function createCreateRequestFn({
  resourcePath,
  token,
  ...options
}) {
  return async function create(body) {
    const [resp] = await request(resourcePath, {
      method: "post",
      body,
      token: token.current,
      ...options
    });
    return resp;
  };
}
function createUpdateRequestFn({
  resourcePath,
  token,
  ...options
}) {
  return async function update(id, body) {
    const [resp] = await request(`${resourcePath}/${id}`, {
      method: "put",
      body,
      token: token.current,
      ...options
    });
    return resp;
  };
}
function createRemoveRequestFn({
  resourcePath,
  token,
  ...options
}) {
  return async function remove(id, body) {
    await request(`${resourcePath}/${id}`, {
      method: "delete",
      body,
      token: token.current,
      ...options
    });
    return body;
  };
}

// src/client/model.ts
var ReactModel = class {
  model;
  client;
  baseUrl;
  token;
  _unstable_offlineModel;
  constructor(options) {
    this.model = options.model;
    this.token = (0, import_react.createRef)();
    this.baseUrl = "";
    this._unstable_offlineModel = options._unstable_offlineModel ?? false;
  }
  modelKeys = {
    get: (id) => ["get", this.model.name, id],
    search: () => ["search", this.model.name],
    searchBy: (args, append) => ["search", this.model.name, args, ...append ? [append] : []],
    create: () => ["create", this.model.name],
    update: () => ["update", this.model.name],
    remove: () => ["delete", this.model.name]
  };
  transform(serialized) {
    return this.model.transformer(serialized);
  }
  initializeCache() {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    const current = this.client.getQueryData(this.modelKeys.search());
    if (Array.isArray(current?.results)) {
      this.sync(current.results);
    } else {
      this.client.setQueryData(this.modelKeys.search(), {
        results: [],
        total: 0,
        offset: 0,
        limit: 99
      });
    }
  }
  sync(input) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    if (!this._unstable_offlineModel) {
      return;
    }
    const searchQueries = this.client.getQueriesData({ queryKey: this.modelKeys.search() });
    const items = Array.isArray(input) ? input : [input];
    for (const [key, current] of searchQueries) {
      if (!current) {
        continue;
      }
      const itemsToUpdate = items.filter(
        (item) => current.results.some(
          (i) => i[this.model.idKey] === item[this.model.idKey]
        )
      );
      const itemsToAdd = items.filter(
        (item) => !current.results.some(
          (i) => i[this.model.idKey] === item[this.model.idKey]
        )
      );
      this.client.setQueryData(key, {
        ...current,
        results: [
          ...current.results.map((i) => {
            if (itemsToUpdate.some(
              (item) => item[this.model.idKey] === i[this.model.idKey]
            )) {
              return itemsToUpdate.find(
                (item) => item[this.model.idKey] === i[this.model.idKey]
              );
            }
            return i;
          }),
          ...itemsToAdd
        ]
      });
    }
    this.client.setQueriesData(
      {
        queryKey: ["get", this.model.name]
      },
      (current) => {
        return items.find(
          (item) => item[this.model.idKey] === current?.[this.model.idKey]
        );
      }
    );
  }
  async destroy(id) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    if (!this._unstable_offlineModel) {
      return;
    }
    await Promise.all([
      this.client.cancelQueries({
        queryKey: this.modelKeys.get(id)
      }),
      this.client.cancelQueries({
        queryKey: this.modelKeys.search()
      })
    ]);
    const searchQueries = this.client.getQueriesData({ queryKey: this.modelKeys.search() });
    for (const key of searchQueries) {
      const current = this.client.getQueryData(key) ?? { results: [], total: 0, offset: 0, limit: 99 };
      this.client.setQueryData(key, {
        ...current,
        results: current.results.filter(
          (item) => item[this.model.idKey] !== id
        )
      });
    }
    this.client.setQueryData(this.modelKeys.get(id), null);
  }
  getInitialSearchData({
    limit = 99,
    offset = 0,
    orderBy,
    fields = []
  }) {
    if (!this._unstable_offlineModel) {
      return void 0;
    }
    const collection = this.client?.getQueryData(this.modelKeys.search());
    function matchesFields(fields2) {
      return (item) => {
        return fields2.some((field) => {
          const fieldValue = (0, import_lodash.get)(item, field.name);
          const compareValue = typeof fieldValue === "string" ? fieldValue.toLowerCase() : fieldValue;
          if (field.is) {
            return String(compareValue) === String(field.is).toLowerCase();
          }
          if (field.isOneOf) {
            return field.isOneOf.some((is) => is === compareValue);
          }
          if (field.contains) {
            return String(compareValue).includes(
              String(field.contains).toLowerCase()
            );
          }
          if (field.isLikeOneOf) {
            return field.isLikeOneOf.some(
              (like) => String(compareValue).includes(String(like).toLowerCase()) && String(compareValue).includes(String(like).toLowerCase())
            );
          }
          if (field.isGreaterThan) {
            return compareValue > field.isGreaterThan;
          }
          if (field.isLessThan) {
            return compareValue < field.isLessThan;
          }
          if (field.isBetween) {
            return compareValue >= field.isBetween[0] && compareValue <= field.isBetween[1];
          }
          return false;
        });
      };
    }
    let results = collection?.results.filter(matchesFields(fields)) ?? [];
    const { key = null, order = "asc" } = typeof orderBy === "string" ? (() => {
      try {
        return JSON.parse(orderBy);
      } catch (e) {
        return {};
      }
    })() : orderBy || {};
    if (key) {
      results = (0, import_lodash.sortBy)(results, [key]);
    }
    if (order === "desc") {
      results = (0, import_lodash.reverse)(results);
    }
    results = results.slice(offset, offset + limit);
    return {
      results,
      total: results.length,
      offset,
      limit
    };
  }
  preparePayloadForSubmission(schema, payload) {
    const pruned = undefinedToNull(
      noEmptyStringValues(noAdditionalProperties(schema, payload))
    );
    return pruned;
  }
  async defaultCreateOnMutate(item) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    await Promise.all([
      this.client.cancelQueries({
        queryKey: this.modelKeys.get(String(item[this.model.idKey]))
      }),
      this.client.cancelQueries({
        queryKey: this.modelKeys.search()
      })
    ]);
    const previous = this.client.getQueryData(this.modelKeys.get(String(item[this.model.idKey])));
    this.sync(item);
    return { previous };
  }
  defaultCreateOnSuccess() {
    this.client?.invalidateQueries({
      queryKey: this.modelKeys.search()
    });
  }
  defaultCreateOnError(err, item, context) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    if (context?.previous) {
      this.destroy(String(item[this.model.idKey]));
    }
    this.client.invalidateQueries({
      queryKey: this.modelKeys.search()
    });
  }
  bindCreateMutation() {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    this.client.setMutationDefaults(this.modelKeys.create(), {
      mutationFn: (item) => {
        const pruned = this.preparePayloadForSubmission(
          this.model.schemas.create,
          item
        );
        return createCreateRequestFn({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
          token: this.token
        })(pruned);
      },
      onMutate: this.defaultCreateOnMutate.bind(this),
      onSuccess: this.defaultCreateOnSuccess.bind(this),
      onError: this.defaultCreateOnError.bind(this)
    });
  }
  cacheCursor(commonArgs, offset, limit, next, prev) {
    if (next || prev) {
      const key = this.modelKeys.searchBy(commonArgs, "cursors");
      const cursors = this.client?.getQueryData(key) || {};
      if (next) {
        cursors[offset + limit] = { next, prev: cursors[offset + limit]?.prev };
        this.client?.setQueryData(key, cursors);
      }
      if (prev) {
        cursors[offset - limit] = { prev, next: cursors[offset - limit]?.next };
        this.client?.setQueryData(key, cursors);
      }
    }
  }
  getCursor(commonArgs, offset) {
    const key = this.modelKeys.searchBy(commonArgs, "cursors");
    const cursors = this.client?.getQueryData(key) || {};
    let knownCursors = void 0;
    if (!cursors[offset]?.next) {
      const entries = Object.entries(cursors);
      const { bestOffset, bestNext } = entries.reduce(
        (acc, [curOffset, { next }]) => {
          if (+curOffset > acc.bestOffset && +curOffset < offset) {
            return { bestOffset: +curOffset, bestNext: next || "" };
          }
          return acc;
        },
        { bestOffset: -1, bestNext: "" }
      );
      if (bestNext) {
        knownCursors = { [bestOffset]: bestNext };
      }
    }
    return { knownCursors, ...cursors[offset] || {} };
  }
  async defaultUpdateOnMutate(item) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    await Promise.all([
      this.client.cancelQueries({
        queryKey: this.modelKeys.get(String(item[this.model.idKey]))
      }),
      this.client.cancelQueries({
        queryKey: this.modelKeys.search()
      })
    ]);
    const previous = this.client.getQueryData(this.modelKeys.get(String(item[this.model.idKey])));
    if (previous) {
      this.sync(Object.assign(previous, item));
    } else {
      this.sync(item);
    }
    return { previous };
  }
  defaultUpdateOnSuccess() {
    this.client?.invalidateQueries({
      queryKey: this.modelKeys.search()
    });
  }
  defaultUpdateOnError(err, _item, context) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    if (context?.previous) {
      this.sync(context.previous);
    }
    this.client?.invalidateQueries({
      queryKey: this.modelKeys.search()
    });
  }
  bindUpdateMutation() {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    this.client.setMutationDefaults(this.modelKeys.update(), {
      mutationFn: (item) => {
        const id = item[this.model.idKey];
        const pruned = this.preparePayloadForSubmission(
          this.model.schemas.update,
          item
        );
        return createUpdateRequestFn({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
          token: this.token
        })(id, pruned);
      },
      onMutate: this.defaultUpdateOnMutate.bind(this),
      onSuccess: this.defaultUpdateOnSuccess.bind(this),
      onError: this.defaultUpdateOnError.bind(this)
    });
  }
  async defaultRemoveOnMutate(item) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    await this.client.cancelQueries({
      queryKey: this.modelKeys.search()
    });
    const previous = this.client.getQueryData(this.modelKeys.get(String(item[this.model.idKey])));
    this.destroy(String(item[this.model.idKey]));
    this.client.setQueryData(
      this.modelKeys.get(String(item[this.model.idKey])),
      null
    );
    return { previous };
  }
  defaultRemoveOnSuccess() {
    this.client?.invalidateQueries({
      queryKey: this.modelKeys.search()
    });
  }
  defaultRemoveOnError(err, _item, context) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    if (typeof context?.previous !== "undefined") {
      this.sync(context.previous);
    }
    this.client.invalidateQueries({
      queryKey: this.modelKeys.search()
    });
  }
  bindRemoveMutation() {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    this.client.setMutationDefaults(this.modelKeys.remove(), {
      retry: false,
      mutationFn: (item) => {
        const id = item[this.model.idKey];
        return createRemoveRequestFn({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
          token: this.token
        })(id, item);
      },
      onMutate: this.defaultRemoveOnMutate.bind(this),
      onSuccess: this.defaultRemoveOnSuccess.bind(this),
      onError: this.defaultRemoveOnError.bind(this)
    });
  }
  bind({ client, baseUrl, token }) {
    this.client = client;
    this.baseUrl = baseUrl;
    this.token = token;
    this.bindCreateMutation();
    this.bindUpdateMutation();
    this.bindRemoveMutation();
    if (this._unstable_offlineModel) {
      this.initializeCache();
    }
    return this;
  }
  get({ id = "", fields = [], path = {} } = {
    id: "",
    fields: [],
    path: {}
  }, options) {
    const query = (0, import_react_query.useQuery)({
      queryKey: [...this.modelKeys.get(id), path],
      enabled: options?.enabled !== false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnMount: true,
      retryOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 0,
      gcTime: 0,
      initialData: this._unstable_offlineModel ? () => {
        return this.peek(id);
      } : void 0,
      ...options,
      queryFn: () => createGetRequestFn({
        resourcePath: buildResourcePath(
          this.baseUrl,
          this.model.resource,
          path
        ),
        token: this.token
      })(id, encodeSearchQuery(fields)),
      select: (data) => this.transform(data)
    });
    const ret = (0, import_react.useMemo)(
      () => ({
        ...query,
        isUpdating: query.isLoading || query.isFetching,
        data: query.data ?? void 0
      }),
      [query]
    );
    return ret;
  }
  query({
    offset,
    limit = 99,
    orderBy,
    fields = [],
    comparator = "or",
    path
  } = {}, options) {
    const commonArgs = {
      orderBy,
      fields,
      path
    };
    const queryKey = this.modelKeys.searchBy({
      limit,
      offset,
      ...commonArgs
    });
    const query = (0, import_react_query.useQuery)({
      queryKey,
      queryFn: async () => {
        const searchQuery = encodeSearchQuery(fields);
        const cursor = this.getCursor(commonArgs, offset || 0);
        const { results, total, next, prev } = await createSearchRequestFn({
          resourcePath: buildResourcePath(
            this.baseUrl,
            this.model.resource,
            path
          ),
          token: this.token,
          headers: {
            "X-Pagination-Fieldoperator": comparator
          }
        })({
          limit,
          offset,
          orderBy: typeof orderBy === "string" ? orderBy : JSON.stringify(orderBy),
          next: cursor.next,
          // prev: cursor.prev, // ignoring prev for now since the BE is not dealing with it correctly
          knownCursors: cursor.knownCursors && JSON.stringify(cursor.knownCursors),
          ...searchQuery
        });
        if (options?.enabled !== false) {
          this.cacheCursor(commonArgs, offset || 0, limit, next, prev);
        }
        this.sync(results);
        return {
          results,
          total,
          offset,
          limit,
          next,
          prev
        };
      },
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnMount: true,
      retryOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 0,
      gcTime: 0,
      initialData: this._unstable_offlineModel ? () => {
        return this.getInitialSearchData({
          limit,
          offset,
          orderBy,
          fields
        });
      } : void 0,
      ...options,
      select: (data) => {
        return Object.assign(data, {
          results: data.results.map((d) => this.transform(d))
        });
      }
    });
    const emptyResults = (0, import_react.useMemo)(() => [], []);
    const ret = (0, import_react.useMemo)(() => {
      return {
        ...query,
        data: query.data?.results ?? emptyResults,
        total: query.data?.total ?? 0,
        offset: query.data?.offset ?? 0,
        limit: query.data?.limit ?? 99,
        isUpdating: query.isLoading || query.isFetching
      };
    }, [query]);
    return ret;
  }
  create(options = {}) {
    return (0, import_react_query.useMutation)({
      mutationKey: this.modelKeys.create(),
      ...options,
      onSuccess: (data, variables, context) => {
        this.defaultCreateOnSuccess();
        options.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        this.defaultCreateOnError(error, variables, context);
        options.onError?.(error, variables, context);
      }
    });
  }
  update(options = {}) {
    return (0, import_react_query.useMutation)({
      mutationKey: this.modelKeys.update(),
      ...options,
      onSuccess: (data, variables, context) => {
        this.defaultUpdateOnSuccess();
        options.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        this.defaultUpdateOnError(error, variables, context);
        options.onError?.(error, variables, context);
      }
    });
  }
  remove(options = {}) {
    return (0, import_react_query.useMutation)({
      mutationKey: this.modelKeys.remove(),
      ...options,
      onSuccess: (data, variables, context) => {
        this.defaultRemoveOnSuccess();
        options.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        this.defaultRemoveOnError(error, variables, context);
        options.onError?.(error, variables, context);
      }
    });
  }
  invalidate() {
    this.client?.invalidateQueries({ queryKey: this.modelKeys.search() });
  }
  invalidateById(id) {
    this.client?.invalidateQueries({ queryKey: this.modelKeys.get(id) });
  }
  read() {
    return this.client?.getQueryData(this.modelKeys.search());
  }
  readOne(id) {
    return this.client?.getQueryData(this.modelKeys.get(id));
  }
  peek(id) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    const { results = [] } = this.client.getQueryData(this.modelKeys.search()) ?? {};
    return results.find((item) => item[this.model.idKey] === id);
  }
  warm(options) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    const { queryOptions = {}, refetchInterval = 3e4 } = options;
    const {
      limit = 99,
      offset,
      orderBy,
      fields = [],
      comparator = "or",
      path
    } = queryOptions;
    const commonArgs = {
      orderBy,
      fields,
      path
    };
    const queryKey = this.modelKeys.searchBy({
      limit,
      offset,
      ...commonArgs
    });
    return (0, import_react_query.useQuery)({
      queryKey,
      queryFn: async () => {
        const searchQuery = encodeSearchQuery(fields);
        const cursor = this.getCursor(commonArgs, offset || 0);
        const { results, total, next, prev } = await createSearchRequestFn({
          resourcePath: buildResourcePath(
            this.baseUrl,
            this.model.resource,
            path
          ),
          token: this.token,
          headers: {
            "X-Pagination-Fieldoperator": comparator
          }
        })({
          limit,
          offset,
          orderBy: typeof orderBy === "string" ? orderBy : JSON.stringify(orderBy),
          next: cursor.next,
          knownCursors: cursor.knownCursors && JSON.stringify(cursor.knownCursors),
          ...searchQuery
        });
        this.cacheCursor(commonArgs, offset || 0, limit, next, prev);
        this.sync(results);
        return {
          results,
          total,
          offset,
          limit,
          next,
          prev
        };
      },
      staleTime: 0,
      gcTime: Infinity,
      select: () => void 0,
      refetchInterval
    });
  }
  async prefetch(params) {
    if (!this.client) {
      throw new Error("Client is not bound");
    }
    const { queryOptions = {}, queryConfig = {} } = params;
    const { limit = 99, offset, orderBy, fields = [], path } = queryOptions;
    const commonArgs = {
      orderBy,
      fields,
      path
    };
    const queryKey = this.modelKeys.searchBy({
      limit,
      offset,
      ...commonArgs
    });
    return this.client.prefetchQuery({
      ...queryConfig,
      queryKey,
      queryFn: async () => {
        const searchQuery = encodeSearchQuery(queryOptions.fields || []);
        const cursor = this.getCursor({}, 0);
        const { results, total, next, prev } = await createSearchRequestFn({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
          token: this.token,
          headers: {
            "X-Pagination-Fieldoperator": queryOptions.comparator ?? "or"
          }
        })({
          limit: queryOptions.limit ?? 99,
          offset: queryOptions.offset,
          orderBy: typeof queryOptions.orderBy === "string" ? queryOptions.orderBy : JSON.stringify(queryOptions.orderBy),
          next: cursor.next,
          knownCursors: cursor.knownCursors && JSON.stringify(cursor.knownCursors),
          ...searchQuery
        });
        if (this._unstable_offlineModel) {
          this.sync(results);
        }
        return {
          results: results.map((d) => this.transform(d)),
          total,
          offset: queryOptions.offset ?? 0,
          limit: queryOptions.limit ?? 99,
          next,
          prev
        };
      }
    });
  }
  updateCacheById(id, model) {
    this.client?.setQueryData(this.modelKeys.get(id), model);
  }
  prepareSearchParams(params, pageParam) {
    const { sort, ...rest } = params;
    const searchParams = {
      ...rest,
      cursor: typeof pageParam === "string" ? pageParam : void 0,
      limit: params?.limit ?? this.model.infiniteSearch?.defaultLimit ?? 50
    };
    if (sort) {
      return {
        ...searchParams,
        sort: JSON.stringify(sort)
      };
    }
    return searchParams;
  }
  useInfiniteSearch(params, options) {
    if (!this.model.infiniteSearch?.enabled) {
      throw new Error("Infinite search is not enabled for this model");
    }
    const queryKey = this.modelKeys.searchBy(
      params ?? { limit: this.model.infiniteSearch?.defaultLimit ?? 50 },
      "infinite"
    );
    return (0, import_react_query.useInfiniteQuery)({
      queryKey,
      initialPageParam: null,
      queryFn: async ({ pageParam }) => {
        const searchParams = this.prepareSearchParams(
          params ?? { limit: this.model.infiniteSearch?.defaultLimit ?? 50 },
          pageParam
        );
        const response = await createSearchRequestFn({
          resourcePath: buildResourcePath(this.baseUrl, this.model.resource),
          token: this.token
        })(searchParams);
        return {
          results: response.results.map((result) => this.transform(result)),
          nextCursor: response.next,
          total: response.total,
          metadata: {
            currentResults: response.results.length,
            historicalResults: 0,
            timePeriodCovered: [
              (/* @__PURE__ */ new Date()).toISOString(),
              (/* @__PURE__ */ new Date()).toISOString()
            ]
          }
        };
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
      ...options
    });
  }
};

// src/client/procedure.ts
var import_react_query2 = require("@tanstack/react-query");
var import_react2 = require("react");
var ReactProcedure = class {
  baseUrl;
  token;
  client;
  procedure;
  constructor(options) {
    this.procedure = options.procedure;
    this.token = (0, import_react2.createRef)();
    this.baseUrl = "";
  }
  bind({ client, baseUrl, token }) {
    this.baseUrl = baseUrl;
    this.client = client;
    this.token = token;
    return this;
  }
  run(options = {}) {
    const mutation = (0, import_react_query2.useMutation)({
      mutationKey: [this.procedure.name],
      mutationFn: async (params) => {
        const url = buildResourcePath(
          this.baseUrl,
          this.procedure.resource,
          params
        );
        const paramsForQueryString = paramsForQuery(
          this.procedure.resource,
          this.procedure.method.toLowerCase() === "get" ? params : {}
        );
        const [resp] = await request(url, {
          method: this.procedure.method,
          body: this.procedure.method.toLowerCase() === "get" ? void 0 : params,
          token: this.token.current,
          query: convertQueryParamKeysToKabobCase(paramsForQueryString)
        });
        return resp;
      },
      ...options
    });
    return {
      ...mutation,
      mutate: mutation.mutate,
      run: mutation.mutateAsync
    };
  }
};

// src/client/resource.ts
var import_react_query3 = require("@tanstack/react-query");
var import_react3 = require("react");
var ReactResource = class {
  resource;
  baseUrl;
  token;
  client;
  constructor(options) {
    this.resource = options.resource;
    this.token = (0, import_react3.createRef)();
    this.baseUrl = "";
  }
  bind({ client, baseUrl, token }) {
    this.baseUrl = baseUrl;
    this.client = client;
    this.token = token;
    return this;
  }
  get(params, options) {
    return (0, import_react_query3.useQuery)({
      queryKey: [this.resource.resource, params],
      queryFn: async () => {
        const [data] = await request(
          buildResourcePath(this.baseUrl ?? "", this.resource.resource, params),
          {
            token: this.token?.current
          }
        );
        return data;
      },
      refetchOnMount: true,
      retryOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      ...options
    });
  }
};

// src/client/api.ts
function createApi({
  models,
  fns,
  resources,
  client,
  baseUrl,
  token
}) {
  return {
    ...Object.keys(models).reduce(
      (acc, key) => ({
        ...acc,
        [key]: new ReactModel({
          baseUrl,
          model: models[key],
          _unstable_offlineModel: models[key]._unstable_offlineModel
        }).bind({
          client,
          baseUrl,
          token
        })
      }),
      {}
    ),
    ...Object.keys(fns).reduce(
      (acc, key) => ({
        ...acc,
        [key]: new ReactProcedure({
          procedure: fns[key]
        }).bind({
          client,
          baseUrl,
          token
        })
      }),
      {}
    ),
    ...Object.keys(resources).reduce(
      (acc, key) => ({
        ...acc,
        [key]: new ReactResource({
          resource: resources[key]
        }).bind({
          client,
          baseUrl,
          token
        })
      }),
      {}
    )
  };
}

// src/client/hooks.tsx
var import_react_query4 = require("@tanstack/react-query");
var import_react4 = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var ApiContext = (0, import_react4.createContext)(null);
function ApiProvider({
  client = new import_react_query4.QueryClient(),
  baseUrl,
  models = {},
  fns = {},
  resources = {},
  children,
  token
}) {
  const tokenRef = (0, import_react4.useRef)(token ?? null);
  tokenRef.current = token ?? null;
  const api = createApi({
    client,
    models,
    fns,
    resources,
    baseUrl,
    token: tokenRef
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_query4.QueryClientProvider, { client, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApiContext.Provider, { value: { api }, children }) });
}
function createApiProvider({
  models = {},
  fns = {},
  resources = {}
}) {
  return function ApiProviderHook(props) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApiProvider, { ...props, models, fns, resources });
  };
}
function useApi() {
  const context = (0, import_react4.useContext)(
    ApiContext
  );
  if (!context) {
    throw new Error(
      "Axiom's useApi hook must be used within a child of ApiProvider."
    );
  }
  return context.api;
}
function createUseApiHook({}) {
  return function useApiHook() {
    return useApi();
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ReactModel,
  ReactProcedure,
  ReactResource,
  buildResourcePath,
  createApi,
  createApiProvider,
  createCallRequestFn,
  createCreateRequestFn,
  createGetRequestFn,
  createRemoveRequestFn,
  createSearchRequestFn,
  createUpdateRequestFn,
  createUseApiHook,
  paramsForQuery,
  request
});
//# sourceMappingURL=client.cjs.map