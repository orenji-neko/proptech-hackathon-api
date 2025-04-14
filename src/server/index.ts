import Elysia from "elysia";

import { user } from "./modules";
import { database, error, logger, authentication } from "./middleware";

export default new Elysia()
  // Middlewares
  .use(database)
  .use(logger)
  .use(error)
  .use(authentication)
  // Modules
  .use(user);
