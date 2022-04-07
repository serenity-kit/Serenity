import { prisma } from "../../src/database/prisma";
import sodium from "libsodium-wrappers-sumo";

// @ts-expect-error
global.setImmediate = jest.useRealTimers;

beforeAll(async () => {
  await sodium.ready;
});

// global setup for Jest, runs once per test file0
beforeEach(async () => {
  // TODO await emptyDatabase();
});

afterAll(() => {
  // disconnect Prisma from the database after all tests are complete
  // to avoid open handles stopping Jest from exiting
  prisma.$disconnect();
});
