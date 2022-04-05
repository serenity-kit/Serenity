import { prisma } from "../../src/database/prisma";

// @ts-expect-error
global.setImmediate = jest.useRealTimers;

// global setup for Jest, runs once per test file0
beforeEach(async () => {
  // TODO await emptyDatabase();
});

afterAll(() => {
  // disconnect Prisma from the database after all tests are complete
  // to avoid open handles stopping Jest from exiting
  prisma.$disconnect();
});
