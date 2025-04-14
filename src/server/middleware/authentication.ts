import jwt from "@elysiajs/jwt";
import Elysia from "elysia";
import database from "./database";

/**
 * Authentication Middleware
 * @description 
 */
export default new Elysia({ name: "authentication" })
  .use(database)
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET ? Bun.env.JWT_SECRET : "",
    })
  )
  .macro({
    /**
     * Authorize
     * @description Enables authorization on the route.
     * @param enabled Enable authorization
     */
    authorize(roles: ("customer" | "agent" | "admin")[] | null) {
      if (!roles) {
        return;
      }

      return {
        async beforeHandle({ jwt, error, headers, prisma }) {
          // get token from Authorization header
          const token = headers.authorization
            ? headers.authorization.split(" ")[1]
            : null;

          // no token exists
          if (!token) {
            throw error(401, "Token Invalid");
          }

          // get user associated with token
          const decoded = (await jwt.verify(token)) as { id: number };
          const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
              admin: true,
              agent: true,
              customer: true
            }
          });

          // no user found
          if (!user) {
            throw error(401, "No user found associated with token");
          }

          let success = false;
          // check roles
          roles.forEach((role) => {
            if(user[role]) {
              success = true;
            }
          });

          if(!success) throw error(401, "Unauthorized");
          
        },
      };
    },
  })
  /**
   * @description Whenever a request has a auth token,
   * the token is parsed and the user associated with
   * the token is fetched, and then added to each context.
   */
  .derive(async ({ headers, prisma, jwt }) => {
    const token = headers.authorization
      ? headers.authorization.split(" ")[1]
      : null;

    if (!token) {
      return {
        user: null,
      };
    }

    const decoded = (await jwt.verify(token)) as { id: number };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    return {
      currentUser: user,
    };
  })
  .as("global");
