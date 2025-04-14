import { Elysia, error } from "elysia";
import pino from "pino";
import { PrismaClient } from "../../generated/prisma";

/**
 * Database Middleware.
 */
export default new Elysia({ name: "database" })
  .decorate("prisma", new PrismaClient())
  .as("global");