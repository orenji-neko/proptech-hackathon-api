import Elysia from "elysia";

import { user, file } from "./modules";
import { database, error, logger, authentication } from "./middleware";

export default new Elysia()
  // Middlewares
  .use(database)
  .use(logger)
  .use(error)
  .use(authentication)
  .use(file)
  // Modules
  .use(user);
