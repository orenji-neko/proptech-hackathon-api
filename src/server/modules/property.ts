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
   * [GET] /properties/:propertyId
   */
  .get("/:propertyId", async ({ params, prisma }) => {
    const propertyId = parseInt(params.propertyId);

    const property = await prisma.property.findUnique({
      where: {
        id: propertyId
      },
      include: {
        type: true,
      },
    });

    return property;
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
      const {
        name,
        location,
        price,
        imageName,
        typeId, 
        status,
        latitude,
        longitude,
        description
      } = body;

      const property = await prisma.property.create({
        data: {
          name: name,
          location: location,
          price: price,
          imageName: imageName,
          status: status,
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
          latitude: latitude,
          longitude: longitude,
          description: description
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
        latitude: t.Optional(t.String()),
        longitude: t.Optional(t.String()),
        description: t.String(),
        status: t.String({ examples: ["rent", "buy"] }),
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
      const {
        name,
        location,
        price,
        imageName,
        typeId,
        status,
        latitude,
        longitude,
        description
      } = body;

      const user = await prisma.property.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          location: location,
          price: price,
          imageName: imageName,
          status: status,
          type: {
            update: {
              id: typeId,
            },
          },
          latitude: latitude,
          longitude: longitude,
          description: description
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
        latitude: t.Optional(t.String()),
        longitude: t.Optional(t.String()),
        status: t.String(),
        description: t.String()
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
