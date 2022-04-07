import { prisma } from "../../src/database/prisma";
import sodium from "libsodium-wrappers-sumo";
const util = require("util");
const exec = util.promisify(require("child_process").exec);

// @ts-expect-error
global.setImmediate = jest.useRealTimers;

const databaseName = "serenity_test";
const connectionString = `postgres://prisma:prisma@localhost:5432/${databaseName}`;
const prismaBinary = "./node_modules/.bin/prisma";
// Set the required environment variable to contain the connection string
// to our database
process.env.POSTGRES_URL = connectionString;
global.process.env.POSTGRES_URL = connectionString;

beforeAll(async () => {
  await sodium.ready;
  prisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS ${databaseName}`);

  // Run the migrations to ensure our schema has the required structure
  await exec(`POSTGRES_URL=${connectionString} ${prismaBinary} migrate deploy`);
  // Regenerate client
  await exec(`POSTGRES_URL=${connectionString} ${prismaBinary} generate`);
});

afterAll(() => {
  // disconnect Prisma from the database after all tests are complete
  // to avoid open handles stopping Jest from exiting
  prisma.$disconnect();
});
