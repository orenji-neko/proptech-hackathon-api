import { Elysia, t } from "elysia";
import { error, database, authentication, logger } from "../middleware";

export default new Elysia({ name: "user", prefix: "/users" })
  .use(logger)
  .use(error)
  .use(database)
  .use(authentication)
  /**
   * [GET] /users
   * Gets all users in an array.
   */
  .get(
    "/",
    async ({ prisma }) => {
      return await prisma.user.findMany();
    },
    {
      authorize: ["admin"],
    }
  )
  /**
   * [POST] /users
   * Creates a user account depending on role.
   */
  .post(
    "/",
    async ({ error, body, prisma, set }) => {
      const { email, password, lname, fname, bday, address, gender, role } =
        body;
      const user = await prisma.user.create({
        data: {
          email: email,
          password: password,
          lname: lname,
          fname: fname,
          bday: bday,
          address: address,
          gender: gender,
        },
        select: {
          id: true,
          email: true,
          password: false,
          lname: true,
          fname: true,
          bday: true,
          address: true,
          gender: true,
        },
      });

      if (role.toLowerCase() === "customer") {
        await prisma.customer.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });
      } else if (role.toLowerCase() === "agent") {
        await prisma.agent.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });
      } else if (role.toLowerCase() === "admin") {
        await prisma.admin.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });
      } else {
        throw new Error();
      }

      return user;
    },
    {
      authorize: ["admin"],
      body: t.Object({
        email: t.String(),
        password: t.String({ minLength: 8 }),
        lname: t.String(),
        fname: t.String(),
        bday: t.Date(),
        address: t.String(),
        gender: t.String(),
        role: t.String({ examples: ["admin", "agent", "customer"] }),
      }),
    }
  )
  /**
   * [PUT] /user/:id
   * Updates a specific user based on the id.
   */
  .put(
    "/:id",
    async ({ params, body, prisma }) => {
      const id = parseInt(params.id);
      const { email, password, lname, fname, bday, address, gender, role } =
        body;

      const user = await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          email: email,
          password: password,
          lname: lname,
          fname: fname,
          bday: bday,
          address: address,
          gender: gender,
        },
      });

      return user;
    },
    {
      authorize: ["admin"],
      body: t.Object({
        email: t.String(),
        password: t.String({ minLength: 8 }),
        lname: t.String(),
        fname: t.String(),
        bday: t.Date(),
        address: t.String(),
        gender: t.String(),
        role: t.String({ examples: ["admin", "agent", "customer"] }),
      }),
    }
  )
  /**
   * [DELETE] /user/:id
   * Gets a specific user based on the id.
   */
  .delete(
    "/:userId",
    async ({ error, params, prisma }) => {
      const id = parseInt(params.userId);

      const user = await prisma.user.delete({
        where: {
          id: id,
        },
      });
      if (!user) {
        throw error(404);
      }

      return user;
    },
    {
      authorize: ["admin"],
    }
  )
  /**
   * [POST] /user/login
   * Authentication, generates bearer token.
   */
  .post(
    "/login",
    async ({ error, body, jwt, prisma }) => {
      const { email, password } = body;

      // user search
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
        include: {
          admin: true,
          agent: true,
          customer: true,
        },
      });
      // if no user found
      if (!user) {
        throw error(404);
      }

      // password checking
      const match = await Bun.password.verify(
        password,
        user.password,
        "bcrypt"
      );
      if (!match) {
        throw error(400);
      }

      // generate token
      const token = await jwt.sign({
        id: user.id,
      });

      return {
        token: token,
        user: {
          id: user.id,
          role: user.admin ? "admin" : user.agent ? "agent" : "customer",
        },
      };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String({ minLength: 8 }),
      }),
    }
  )
  /**
   * [POST] /user/register
   * Creates customer account.
   */
  .post(
    "/register",
    async ({ error, body, prisma }) => {
      const { email, password, lname, fname, bday, address, gender, role } =
        body;

      const hashedPassword = await Bun.password.hash(password, "bcrypt");

      try {
        // create user
        const user = await prisma.user.create({
          data: {
            email: email,
            password: hashedPassword,
            lname: lname,
            fname: fname,
            bday: bday,
            address: address,
            gender: gender,
          },
          select: {
            id: true,
            email: true,
            password: false,
            lname: true,
            fname: true,
            bday: true,
            address: true,
            gender: true,
          },
        });

        if (role === "agent") {
          // create customer profile
          await prisma.agent.create({
            data: {
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
        } else if (role === "customer") {
          // create customer profile
          await prisma.customer.create({
            data: {
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
        } else {
          throw error(400);
        }

        return user;
      } catch (err) {
        throw error(400);
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
        lname: t.String(),
        fname: t.String(),
        bday: t.Date(),
        address: t.String(),
        gender: t.String({ examples: ["male", "female"] }),
        role: t.String({ examples: ["agent", "customer"] }),
      }),
    }
  );
