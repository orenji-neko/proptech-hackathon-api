import Elysia from "elysia";

import { user, file, property, rent, customer } from "./modules";
import { database, error, logger, authentication } from "./middleware";

export default new Elysia()
  // Middlewares
  .use(database)
  .use(logger)
  .use(error)
  .use(authentication)
  .use(file)
  // Modules
  .use(user)
  .use(property)
  .use(rent)
  .use(customer);
