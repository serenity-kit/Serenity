import { PrismaClient } from "../../prisma/generated/output";

export const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
  ],
});

prisma.$on("query", async (e) => {
  console.log(`${e.query} ${e.params}`);
});
