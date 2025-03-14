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

// src/server/index.ts
var server_exports = {};
__export(server_exports, {
  CombinedService: () => CombinedService,
  Controller: () => Controller,
  DEFAULT_COMBINED_SERVICE_CONFIGURATION: () => DEFAULT_COMBINED_SERVICE_CONFIGURATION,
  DEFAULT_SERVICE_CONFIGURATION: () => DEFAULT_SERVICE_CONFIGURATION,
  Nullable: () => Nullable2,
  Service: () => Service,
  combineServices: () => combineServices,
  compose: () => compose,
  isCombinedService: () => isCombinedService,
  isService: () => isService,
  serverless: () => serverless
});
module.exports = __toCommonJS(server_exports);

// src/server/controller.ts
var import_router = __toESM(require("@koa/router"), 1);

// src/server/middleware.ts
function compose(middleware) {
  return async (context, next) => {
    let index = -1;
    const dispatch = async (i) => {
      if (i <= index) {
        return Promise.reject(new Error("next() called multiple times"));
      }
      index = i;
      let fn = middleware[i];
      if (i === middleware.length) {
        fn = next;
      }
      if (!fn) {
        return Promise.resolve();
      }
      try {
        return await fn(context, dispatch.bind(null, i + 1));
      } catch (err) {
        return Promise.reject(err);
      }
    };
    return dispatch(0);
  };
}

// src/server/validation.ts
var import_typebox3 = require("@sinclair/typebox");
var import_value2 = require("@sinclair/typebox/value");

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

// src/server/validation.ts
var formats = {
  palindrome: (v) => /^[a-zA-Z0-9]*$/.test(v),
  email: (v) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v),
  uuid: (v) => /^[a-f\d]{8}(-[a-f\d]{4}){4}[a-f\d]{8}$/i.test(v),
  hexcolor: (v) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(v),
  "date-time": (v) => !isNaN(Date.parse(v))
};
Object.entries(formats).forEach(([name, validatorFn]) => {
  try {
    import_system.TypeSystem.Format(name, (value) => validatorFn(value));
  } catch (err) {
  }
});
function parseValueErrors(errors) {
  return errors.reduce(
    (acc, { path, message }) => ({
      ...acc,
      [(path.startsWith("/") ? path.slice(1, path.length) : path).replace(
        "/",
        "."
      )]: message
    }),
    {}
  );
}
function validate(context) {
  return async (ctx, next) => {
    let errors = [];
    if (context.params) {
      errors = [...errors, ...import_value2.Value.Errors(context.params, ctx.params)];
    }
    if (context.req && !import_typebox3.TypeGuard.IsUnknown(context.req) && typeof ctx.request.body !== "undefined") {
      const striped = noAdditionalProperties(context.req, ctx.request.body);
      ctx.request.body = striped;
      const schema = context.req;
      errors = [...errors, ...import_value2.Value.Errors(schema, ctx.request.body)];
    }
    if (errors.length > 0) {
      throw new BadRequestError("Invalid Request", parseValueErrors(errors));
    }
    await next();
    if (context.res && !import_typebox3.TypeGuard.IsUnknown(context.res) && ctx.status < 300 && typeof ctx.body !== "undefined") {
      const striped = noAdditionalProperties(context.res, ctx.body);
      ctx.body = striped;
      const schema = context.res;
      errors = [...errors, ...import_value2.Value.Errors(schema, ctx.body)];
    }
    if (errors.length > 0) {
      throw new BadRequestError("Invalid Response", parseValueErrors(errors));
    }
  };
}

// src/server/controller.ts
function serializer(obj) {
  if (obj === null) {
    return void 0;
  }
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (typeof obj !== "object" || obj === void 0) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(
      (item) => serializer(item)
    );
  }
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = serializer(obj[key]);
    return acc;
  }, {});
}
var Controller = class {
  service;
  prefix;
  tags;
  auth;
  group;
  internal;
  preMatchedRouteMiddleware;
  router;
  operations;
  constructor({
    prefix = "",
    middleware = [],
    tags = [],
    group,
    auth = false,
    internal = false
  } = {}) {
    this.router = new import_router.default();
    this.preMatchedRouteMiddleware = middleware;
    this.tags = tags;
    this.group = group;
    this.auth = auth;
    this.internal = internal;
    this.prefix = prefix;
    this.operations = [];
  }
  routes() {
    return this.router.routes();
  }
  allowedMethods() {
    return this.router.allowedMethods();
  }
  getOperations() {
    return this.operations;
  }
  createOperation(base) {
    return {
      ...base,
      auth: !!base.auth,
      summary: base.name,
      description: base.description ?? "No Description",
      params: base.params ?? import_typebox.Type.Object({}),
      query: base.query ?? import_typebox.Type.Object({}),
      req: base.req ?? import_typebox.Type.Unknown(),
      res: base.res ?? import_typebox.Type.Unknown(),
      middleware: base.middleware ?? [],
      tags: this.tags
    };
  }
  processResponseBody = async (ctx, next) => {
    await next();
    if (typeof ctx.body === "object") {
      ctx.body = serializer(ctx.body);
    }
  };
  register(definition, path, methods, routeMiddleware, options) {
    const passedMiddleware = Array.isArray(routeMiddleware) ? routeMiddleware : [routeMiddleware];
    const finalMiddleware = path.toString().startsWith("(") ? routeMiddleware : [
      ...passedMiddleware.slice(0, passedMiddleware.length - 1),
      validate(definition),
      this.processResponseBody,
      ...this.preMatchedRouteMiddleware,
      ...passedMiddleware.slice(passedMiddleware.length - 1)
    ];
    return this.router.register(
      path,
      methods,
      finalMiddleware,
      options
    );
  }
  bind(router = this.router) {
    this.operations.forEach(([operation, handler]) => {
      const routeHandler = async (ctx, next) => handler(
        Object.assign(ctx, { query: trueFalseStringsToBoolean(ctx.query) }),
        next
      );
      this.register(
        operation,
        operation.path,
        [operation.method],
        [...operation.middleware, routeHandler]
      );
    });
    if (!["", "/"].includes(this.prefix)) {
      router.use(this.prefix, this.routes());
      router.use(this.prefix, this.allowedMethods());
    } else {
      router.use(this.routes());
      router.use(this.allowedMethods());
    }
  }
  addOperation(definition, ...handlers) {
    const operation = this.createOperation(definition);
    this.operations.push([
      operation,
      compose(handlers)
    ]);
  }
};

// src/server/service.ts
var import_router2 = __toESM(require("@koa/router"), 1);
var import_koa = __toESM(require("koa"), 1);
var import_koa_bodyparser = __toESM(require("koa-bodyparser"), 1);
var import_koa_qs = __toESM(require("koa-qs"), 1);
var import_object_sizeof = __toESM(require("object-sizeof"), 1);
var import_pretty_bytes = __toESM(require("pretty-bytes"), 1);
var DEFAULT_SERVICE_CONFIGURATION = {
  cors: {}
};
function isService(service) {
  if (typeof service !== "object" || service === null) {
    return false;
  }
  return "title" in service && typeof service.title === "string" && "description" in service && typeof service.description === "string" && "tags" in service && Array.isArray(service.tags) && "prefix" in service && typeof service.prefix === "string";
}
var Service = class extends import_koa.default {
  version;
  title;
  description;
  tags;
  prefix;
  internal;
  contact;
  license;
  servers;
  controllers;
  children;
  middleware;
  router;
  config;
  onError;
  constructor({
    title = "",
    description = "",
    prefix = "",
    version = "",
    servers = [{ description: "", url: "" }],
    contact = { name: "", email: "", url: "" },
    license = { name: "", url: "" },
    internal = false,
    tags = [],
    controllers = [],
    middlewares = [],
    config = DEFAULT_SERVICE_CONFIGURATION,
    onError
  }) {
    super();
    this.router = new import_router2.default();
    this.version = version;
    this.children = [];
    this.title = title;
    this.description = description;
    this.tags = tags;
    this.internal = internal;
    this.contact = contact;
    this.license = license;
    this.servers = servers;
    this.prefix = prefix;
    this.controllers = controllers;
    this.middleware = middlewares;
    this.config = { ...DEFAULT_SERVICE_CONFIGURATION, ...config };
    this.onError = onError;
  }
  register(controller) {
    this.controllers.push(controller);
  }
  bind(target = this.router) {
    const serviceRouter = new import_router2.default();
    serviceRouter.use((0, import_koa_bodyparser.default)());
    serviceRouter.use(async (ctx, next) => {
      await next();
      const resBodySize = (0, import_object_sizeof.default)(ctx.body);
      if (resBodySize > 5 * 1024 * 1024) {
        this.onError?.(
          new Error(
            `Response body size (${(0, import_pretty_bytes.default)(resBodySize)}) is approaching the lambda limit (6MB)`
          )
        );
      }
      if (resBodySize > 6 * 1024 * 1024) {
        this.onError?.(
          new Error(
            `Response body size (${(0, import_pretty_bytes.default)(resBodySize)}) is greater than the lambda limit (6MB)`
          )
        );
      }
    });
    serviceRouter.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        if (err instanceof Error) {
          this.onError?.(err);
          if (isAPIError(err) && isBadRequestError(err)) {
            ctx.body = {
              type: "BadRequest" /* BadRequest */,
              message: err.message,
              status: 400,
              fields: err.fields
            };
            ctx.status = 400;
          }
          if (isAPIError(err) && isUnauthorizedError(err)) {
            ctx.body = {
              type: "Unauthorized" /* Unauthorized */,
              message: err.message,
              status: 401
            };
            ctx.status = 401;
          }
          if (isAPIError(err) && isForbiddenError(err)) {
            ctx.body = {
              type: "Forbidden" /* Forbidden */,
              message: err.message,
              status: 403
            };
            ctx.status = 403;
          }
          if (isAPIError(err) && isNotFoundError(err)) {
            ctx.body = {
              type: "NotFound" /* NotFound */,
              message: err.message,
              status: 404
            };
            ctx.status = 404;
          }
          if (isAPIError(err) && isInternalServerError(err)) {
            ctx.body = {
              type: "InternalServerError" /* InternalServerError */,
              message: err.message,
              status: 500
            };
            ctx.status = 500;
          }
          if (!isAPIError(err)) {
            ctx.body = {
              type: "InternalServerError" /* InternalServerError */,
              message: "An internal server error occurred.",
              status: 500
            };
            ctx.status = 500;
          }
        } else {
          ctx.body = {
            type: "InternalServerError" /* InternalServerError */,
            message: "An internal server error occurred.",
            status: 500
          };
          ctx.status = 500;
        }
      }
    });
    serviceRouter.use((ctx, next) => {
      if (["POST", "PUT", "PATCH"].includes(ctx.method) && ctx.request.body && typeof ctx.request.body === "object") {
        ctx.request.body = Object.fromEntries(
          Object.entries(ctx.request.body).map(([key, value]) => [
            key,
            value === null ? void 0 : value
          ])
        );
      }
      return next();
    });
    serviceRouter.use((ctx, next) => {
      if (typeof ctx.query === "object") {
        ctx.query = convertQueryParamKeysFromKabobCase(ctx.query);
      }
      return next();
    });
    serviceRouter.use(...this.middleware);
    for (const controller of this.controllers) {
      controller.service = this;
      controller.bind(serviceRouter);
    }
    if (!["", "/"].includes(this.prefix)) {
      target.use(this.prefix, serviceRouter.routes());
      target.use(this.prefix, serviceRouter.allowedMethods());
    } else {
      target.use(serviceRouter.routes());
      target.use(serviceRouter.allowedMethods());
    }
  }
  init(target = this.router) {
    this.bind(target);
    this.use(this.router.routes());
    this.use(this.router.allowedMethods());
  }
  start(port = 8080, addresses = ["127.0.0.1"]) {
    (0, import_koa_qs.default)(this, "extended");
    this.init();
    for (const address of addresses) {
      this.listen(port, address);
    }
  }
};

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
var CombinedService = class extends Service {
  children;
  logo;
  constructor({ children, logo, ...options }) {
    super(options);
    this.logo = logo;
    this.children = children;
  }
};
function combineServices(services, config) {
  const combinedConfig = {
    ...DEFAULT_COMBINED_SERVICE_CONFIGURATION,
    ...config
  };
  const combinedService = new CombinedService({
    servers: combinedConfig.servers,
    title: combinedConfig.title,
    description: combinedConfig.description,
    logo: combinedConfig.logo,
    tags: combinedConfig.tags,
    children: services,
    license: combinedConfig.license,
    onError: combinedConfig.onError
  });
  for (const service of services) {
    service.config = combinedConfig;
    service.init(combinedService.router);
    service.onError = combinedService.onError;
  }
  return combinedService;
}

// src/server/serverless.ts
var import_cors = __toESM(require("@koa/cors"), 1);
var import_serverless_express = __toESM(require("@vendia/serverless-express"), 1);
var import_koa2 = __toESM(require("koa"), 1);
var serverless = (service, corsOptions) => {
  const constructWrappedKoaApp = (app) => {
    const wrapperApp = new import_koa2.default({});
    wrapperApp.proxy = true;
    wrapperApp.use((0, import_cors.default)(corsOptions));
    wrapperApp.use(async (ctx, next) => {
      const { event } = (0, import_serverless_express.getCurrentInvoke)();
      ctx.path = event.requestContext.path;
      ctx.url = event.requestContext.path;
      ctx.query = event.queryStringParameters ?? {};
      await next();
    });
    app.use((0, import_cors.default)(corsOptions));
    app.bind();
    wrapperApp.use(app.router.routes());
    wrapperApp.use(app.router.allowedMethods());
    return wrapperApp;
  };
  return (0, import_serverless_express.default)({
    app: constructWrappedKoaApp(service).callback(),
    resolutionMode: "PROMISE"
  });
};

// src/server/types.ts
var Nullable2 = (schema) => import_typebox.Type.Union([schema, import_typebox.Type.Null()]);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CombinedService,
  Controller,
  DEFAULT_COMBINED_SERVICE_CONFIGURATION,
  DEFAULT_SERVICE_CONFIGURATION,
  Nullable,
  Service,
  combineServices,
  compose,
  isCombinedService,
  isService,
  serverless
});
//# sourceMappingURL=server.cjs.map