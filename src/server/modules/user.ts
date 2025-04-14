import { Elysia, t } from "elysia";
import { error, database, authentication, logger } from "../middleware";

export default new Elysia({ name: "user", prefix: "/users" })
  .use(logger)
  .use(error)
  .use(database)
  .use(authentication)
  .group("/", (app) =>
    app
      /**
       * [GET] /users
       * Gets all users in an array.
       */
      .get(
        "/",
        async ({ prisma }) => {
          return await prisma.user.findMany({
            select: {
              username: true,
            },
          });
        },
        {
          authorize: true,
        }
      )
      /**
       * [GET] /users/:id
       * Gets a specific user based on the id.
       */
      .get(
        "/:id",
        async ({ error, params, prisma }) => {
          const id = Number.parseInt(params.id);

          const user = await prisma.user.findUnique({
            where: {
              id: id,
            },
          });

          if (!user) throw error("Not Found");

          return user;
        },
        {
          authorize: true,
        }
      )
  )
  /**
   * [POST] /users
   * Creates a user account.
   */
  .post(
    "/",
    async ({ error, body, prisma, set }) => {
      const { username, password } = body;

      try {
        const user = await prisma.user.create({
          data: {
            username: username,
            password: password,
          },
        });

        set.status = "Created";
        return user;
      } catch (err) {
        throw error(409);
      }
    },
    {
      authorize: true,
      body: t.Object({
        username: t.String(),
        password: t.String({ minLength: 8 }),
      }),
    }
  )
  /**
   * [PUT] /user/:id
   * Gets a specific user based on the id.
   */
  .put("/:id", async ({ params, prisma }) => {})
  /**
   * [DELETE] /user/:id
   * Gets a specific user based on the id.
   */
  .delete("/:id", async ({ params, prisma }) => {})
  /**
   * [POST] /user/login
   * Gets a specific user based on the id.
   */
  .post(
    "/login",
    async ({ body, jwt }) => {
      jwt.sign()
    },
    {
      authorize: true,
    }
  );
