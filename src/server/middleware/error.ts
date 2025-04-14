import { Elysia } from "elysia";
import pino from "pino";
import logger from "./logger";

/**
 * Error Middleware.
 */
export default new Elysia({ name: "error" })
  .use(logger)
  .onError(({ code, error, logger, path }) => {
    logger.error(error, path);
  })
  .as("global");