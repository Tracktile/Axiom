import { CustomError } from "ts-custom-error";

export enum Errors {
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

class HTTPError extends CustomError {
  type = Errors.InternalServerError;
  status: number;
  errors: Record<string, unknown>;
  constructor(
    status: number,
    message: string,
    errors: Record<string, string> = {}
  ) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function isHTTPError(error: unknown): error is HTTPError {
  return !!error && typeof error === "object" && "status" in error;
}

export class BadRequestError extends HTTPError {
  type = Errors.BadRequest;
  fields: Record<string, string>;
  constructor(message?: string, fieldErrors?: Record<string, string>) {
    super(400, message || "Bad Request");
    this.fields = fieldErrors || {};
  }
}

export function isBadRequestError(error: HTTPError): error is BadRequestError {
  return (
    error.status === 400 &&
    "fields" in error &&
    typeof error.fields === "object"
  );
}

export class UnauthorizedError extends HTTPError {
  type = Errors.Unauthorized;
  constructor(message?: string, errors?: Record<string, string>) {
    super(401, message || "Unauthorized", errors);
  }
}

export class ForbiddenError extends HTTPError {
  type = Errors.Forbidden;
  constructor(message?: string, errors?: Record<string, string>) {
    super(403, message || "Forbidden", errors);
  }
}

export class NotFoundError extends HTTPError {
  type = Errors.NotFound;
  constructor(message?: string, errors?: Record<string, string>) {
    super(404, message || "Not Found", errors);
  }
}

export class InternalServerError extends HTTPError {
  type = Errors.InternalServerError;
  constructor(message?: string, errors?: Record<string, string>) {
    super(500, message || "Internal Server Error", errors);
  }
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
