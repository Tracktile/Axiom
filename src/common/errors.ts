import { CustomError } from "ts-custom-error";

export enum ErrorType {
  // 400
  BadRequest = "BadRequest",
  // 401
  Unauthorized = "Unauthorized",
  // 403
  Forbidden = "Forbidden",
  // 404
  NotFound = "NotFound",
  // 500
  InternalServerError = "InternalServerError",
}

export class APIError extends CustomError {
  type: ErrorType;
  status: number;
  errors: Record<string, unknown>;
  constructor(
    status: number,
    message: string,
    errors: Record<string, string> = {}
  ) {
    super(message);
    this.type = ErrorType.InternalServerError;
    this.status = status;
    this.errors = errors;
  }
}

export function isAPIError(error: unknown): error is APIError {
  return (
    !!error &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
  );
}

export class BadRequestError extends APIError {
  fields: Record<string, string>;
  constructor(message?: string, fieldErrors?: Record<string, string>) {
    super(400, message || "Bad Request");
    this.type = ErrorType.BadRequest;
    this.fields = fieldErrors || {};
  }
}

export function isBadRequestError(error: APIError): error is BadRequestError {
  return error.type === ErrorType.BadRequest && error.status === 400;
}

export class UnauthorizedError extends APIError {
  constructor(message?: string, errors?: Record<string, string>) {
    super(401, message || "Unauthorized", errors);
    this.type = ErrorType.Unauthorized;
  }
}

export function isUnauthorizedError(
  error: APIError
): error is UnauthorizedError {
  return error.type === ErrorType.Unauthorized && error.status === 401;
}

export class ForbiddenError extends APIError {
  constructor(message?: string, errors?: Record<string, string>) {
    super(403, message || "Forbidden", errors);
    this.type = ErrorType.Forbidden;
  }
}

export function isForbiddenError(error: APIError): error is ForbiddenError {
  return error.type === ErrorType.Forbidden && error.status === 403;
}

export class NotFoundError extends APIError {
  constructor(message?: string, errors?: Record<string, string>) {
    super(404, message || "Not Found", errors);
    this.type = ErrorType.NotFound;
  }
}

export function isNotFoundError(error: APIError): error is NotFoundError {
  return error.type === ErrorType.NotFound && error.status === 404;
}

export class InternalServerError extends APIError {
  constructor(message?: string, errors?: Record<string, string>) {
    super(500, message || "Internal Server Error", errors);
    this.type = ErrorType.InternalServerError;
  }
}

export function isInternalServerError(
  error: APIError
): error is InternalServerError {
  return error.type === ErrorType.InternalServerError && error.status === 500;
}

export const assert = (
  condition: any,
  message: string,
  error = BadRequestError
) => {
  if (!condition) {
    throw new error(message);
  }
};
