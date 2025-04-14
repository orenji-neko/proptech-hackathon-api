import Elysia, { t } from "elysia";
import { logger, database, authentication, error } from "../middleware";

export default new Elysia({ name: "rent", prefix: "/rent" })
  .use(logger)
  .use(error)
  .use(database)
  .use(authentication)
  /**
   * [GET] /rent
   * Get all list of rent.
   */
  .get(
    "/",
    async ({ prisma }) => {
      const rent = await prisma.rent.findMany();
      return rent;
    },
    {
      authorize: ["admin", "agent"],
    }
  )
  /**
   * [PUT] /rent/:rentId
   * Edit a rent
   */
  .put(
    "/:rentId",
    async ({ error, params, body, prisma }) => {
      const rentId = parseInt(params.rentId);

      const { endAt, paidAt } = body;

      const rent = await prisma.rent.findUnique({
        where: {
          id: rentId,
        },
      });
      if (!rent) throw error(404);

      const editedRent = await prisma.rent.update({
        where: {
          id: rentId,
        },
        data: {
          endAt: endAt,
          paidAt: paidAt,
        },
      });

      return editedRent;
    },
    {
      authorize: ["admin"],
      body: t.Object({
        endAt: t.Date(),
        paidAt: t.Date(),
      }),
    }
  )
  .delete(
    "/:rentId",
    async ({ error, params, prisma }) => {
      const rentId = parseInt(params.rentId);

      const rent = await prisma.rent.findUnique({
        where: {
          id: rentId,
        },
      });
      if (!rent) throw error(404);

      const deletedRent = await prisma.rent.delete({
        where: {
          id: rentId,
        },
      });

      return deletedRent;
    },
    {
      authorize: ["admin"],
    }
  );
