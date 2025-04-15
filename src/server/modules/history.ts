import Elysia, { t } from "elysia";
import { logger, database, authentication, error } from "../middleware";
import customer from "./customer";

export default new Elysia({ name: "history", prefix: "/history" })
  .use(logger)
  .use(error)
  .use(database)
  .use(authentication)
  .get(
    "/rent",
    async ({ prisma }) => {
      const rentals = await prisma.rent.findMany({
        include: {
          tenant: {
            include: {
              user: true,
            },
          },
          property: true,
        },
      });

      return rentals.map((rent) => ({
        name: rent.property.name,
        description: rent.property.description,
        paidAt: rent.paidAt,
        client: {
          id: rent.tenant.user.id,
          fname: rent.tenant.user.fname,
          lname: rent.tenant.user.lname,
        },
        amount: rent.property.price,
      }));
    },
    {
      authorize: ["admin", "agent", "customer"],
    }
  )
  .get(
    "/purchase",
    async ({ prisma }) => {
      const purchases = await prisma.purchase.findMany({
        include: {
          property: true,
          customer: {
            include: { user: true },
          },
        },
      });

      return purchases.map((purchase) => ({
        name: purchase.property.name,
        description: purchase.property.description,
        paidAt: purchase.paidAt,
        client: {
          id: purchase.customer.user.id,
          fname: purchase.customer.user.fname,
          lname: purchase.customer.user.lname,
        },
        amount: purchase.property.price,
      }));
    },
    {
      authorize: ["admin", "agent", "customer"],
    }
  );
