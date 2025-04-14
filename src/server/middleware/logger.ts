import { Elysia, error } from "elysia";
import pino from "pino";

/**
 * Logger Middleware.
 */
export default new Elysia({ name: "logger" })
  .decorate("logger", pino({
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true
      }
    }
  }))
  .as("global");