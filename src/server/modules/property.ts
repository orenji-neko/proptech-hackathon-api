import Elysia, { t } from "elysia";
import { logger, database, authentication, error } from "../middleware";

export default new Elysia({ name: "property", prefix: "/properties" })
  .use(logger)
  .use(error)
  .use(database)
  .use(authentication)
  /**
   * [GET] /properties
   */
  .get("/", async ({ prisma }) => {
    const properties = await prisma.property.findMany({
      include: {
        type: true,
      },
    });
    return properties;
  })
  /**
   * [GET] /properties/types
   */
  .get("/types", async ({ prisma }) => {
    const types = await prisma.propertyType.findMany();
    return types;
  })
  /**
   * [POST] /properties
   * Add a property
   */
  .post(
    "/",
    async ({ error, body, prisma, currentUser }) => {
      const { name, location, price, imageName, typeId } = body;

      const property = await prisma.property.create({
        data: {
          name: name,
          location: location,
          price: price,
          imageName: imageName,
          type: {
            connect: {
              id: typeId,
            },
          },
          // if not agent, then it will remain undefined
          agent: currentUser?.agent
            ? {
                connect: {
                  userId: currentUser.agent.userId,
                },
              }
            : undefined,
        },
      });

      return property;
    },
    {
      authorize: ["admin", "agent"],
      body: t.Object({
        name: t.String(),
        location: t.String(),
        price: t.Number(),
        imageName: t.String(),
        typeId: t.Number(),
      }),
    }
  )
  /**
   * [PUT] /properties/:id
   */
  .put(
    "/:id",
    async ({ params, body, prisma }) => {
      const id = parseInt(params.id);
      const { name, location, price, imageName, typeId } = body;

      const user = await prisma.property.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          location: location,
          price: price,
          imageName: imageName,
          type: {
            update: {
              id: typeId,
            },
          },
        },
      });

      return user;
    },
    {
      authorize: ["admin", "agent"],
      body: t.Object({
        name: t.String(),
        location: t.String(),
        price: t.Number(),
        imageName: t.String(),
        typeId: t.Number(),
      }),
    }
  )
  /**
   * [DELETE] /properties/:id
   */
  .delete("/:id", async ({ params, prisma }) => {
    const id = parseInt(params.id);

    const user = await prisma.property.delete({
      where: {
        id: id,
      },
    });
  });
