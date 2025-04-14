import Elysia, { t } from "elysia";
import { logger, database, authentication, error } from "../middleware";
import { connect } from "bun";

export default new Elysia({ name: "customer", prefix: "/customer" })
  .use(logger)
  .use(error)
  .use(database)
  .use(authentication)
  .get(
    "/",
    async ({ prisma }) => {
      const customers = await prisma.customer.findMany();
      return customers;
    },
    {
      authorize: ["admin", "agent", "customer"],
    }
  )
  .group("/:id", (app) =>
    app
      /**
       * [GET] /customer/:id
       */
      .get(
        "/",
        async ({ error, params, prisma, currentUser }) => {
          const id = parseInt(params.id);

          // if current user is customer, and the param id is not equal to user id
          if (currentUser?.customer && currentUser.id !== id) {
            throw error(401);
          }

          const user = await prisma.customer.findUnique({
            where: {
              userId: id,
            },
          });
          if (!user) throw error(404);

          return user;
        },
        {
          authorize: ["admin", "agent", "customer"],
        }
      )
      /**
       * [GET] /customer/:id/rent
       * Rent history of customer
       */
      .get(
        "/rent",
        async ({ params, prisma }) => {
          const id = parseInt(params.id);

          const rent = await prisma.rent.findMany({
            where: {
              tenantId: id,
            },
          });

          return rent;
        },
        {
          authorize: ["admin", "agent", "customer"],
        }
      )
      /**
       * [POST] /customer/:id/rent
       * Create rent request.
       */
      .post(
        "/rent",
        async ({ error, body, params, prisma, currentUser }) => {
          const id = parseInt(params.id);
          const { propertyId } = body;

          // if current user is customer, and the param id is not equal to user id
          if (currentUser?.customer && currentUser.id !== id) {
            throw error(401);
          }

          const property = await prisma.property.findUnique({
            where: {
              id: propertyId
            }
          });
          if(!property) throw error(404);

          const rent = await prisma.rent.create({
            data: {
              price: property.price,
              tenant: {
                connect: {
                  userId: id
                }
              },
              property: {
                connect: {
                  id: property.id
                }
              }
            },
            include: {
              property: true
            }
          });

          return rent;
        },
        {
          authorize: ["customer"],
          body: t.Object({
            propertyId: t.Number(),
          })
        }
      )
      /**
       * [POST] /customer/:id/purchase
       * Create purchase  request.
       */
      .post(
        "/purchase",
        async ({ error, body, params, prisma, currentUser }) => {
          const id = parseInt(params.id);
          const { propertyId } = body;

          // if current user is customer, and the param id is not equal to user id
          if (currentUser?.customer && currentUser.id !== id) {
            throw error(401);
          }

          const property = await prisma.property.findUnique({
            where: {
              id: propertyId
            }
          });
          if(!property) throw error(404);

          const purchase = await prisma.purchase.create({
            data: {
              price: property.price,
              customer: {
                connect: {
                  userId: id
                }
              },
              property: {
                connect: {
                  id: property.id
                }
              }
            },
            include: {
              property: true
            }
          });

          return purchase;
        },
        {
          authorize: ["customer"],
          body: t.Object({
            propertyId: t.Number(),
          })
        }
      )
  );
