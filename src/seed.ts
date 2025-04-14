import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();

const seed = async () => {
  // property types
  const propertyType1 = await prisma.propertyType.upsert({
    where: {
      id: 1,
    },
    create: {
      name: "Land",
    },
    update: {},
  });
  const propertyType2 = await prisma.propertyType.upsert({
    where: {
      id: 2,
    },
    create: {
      name: "Studio/Function Hall",
    },
    update: {},
  });
  const propertyType3 = await prisma.propertyType.upsert({
    where: {
      id: 3,
    },
    create: {
      name: "House",
    },
    update: {},
  });
  const propertyType4 = await prisma.propertyType.upsert({
    where: {
      id: 4,
    },
    create: {
      name: "Condo",
    },
    update: {},
  });

  const property1 = await prisma.property.upsert({
    where: {
      id: 1
    },
    create: {
      name: "House No. 1",
      type: {
        connect: {
          id: propertyType3.id
        }
      },
      price: 200.00,
      location: "Elmore Town",
      imageName: "property_1.jpg",
    },
    update: {}
  });
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
