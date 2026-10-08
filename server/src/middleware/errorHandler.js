import { env } from "../config/env.js";

export function notFoundHandler(request, _response, next) {
  const error = new Error(`Route not found: ${request.method} ${request.path}`);
  error.statusCode = 404;
  error.code = "ROUTE_NOT_FOUND";
  next(error);
}

export function errorHandler(error, _request, response, _next) {
  const statusCode = Number.isInteger(error.statusCode)
    ? error.statusCode
    : 500;
  const message =
    statusCode >= 500 && !error.statusCode
      ? "Internal server error"
      : error.message || "Internal server error";

  if (env.nodeEnv !== "test") {
    console.error(`[${error.code || "UNEXPECTED_ERROR"}] ${error.message}`);

    if (env.nodeEnv === "development" && error.cause) {
      console.error(
        `Cause: ${error.cause.name || "Error"} (${error.cause.status || "unknown status"})`,
      );
    }
  }

  response.status(statusCode).json({
    success: false,
    message,
  });
}
