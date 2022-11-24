const util = require("util");
const exec = util.promisify(require("child_process").exec);

module.exports = async function (globalConfig, projectConfig) {
  const databaseName = "serenity_test";
  const connectionString = `postgres://prisma:prisma@localhost:5432/${databaseName}`;
  const prismaBinary = "./node_modules/.bin/prisma";
  // Set the required environment variable to contain the connection string
  // to our database
  process.env.DATABASE_URL = connectionString;
  global.process.env.DATABASE_URL = connectionString;

  // seems to work better than DROP DATABSE
  await exec(
    `DATABASE_URL=${connectionString} ${prismaBinary} migrate reset -f`
  );

  // Run the migrations to ensure our schema has the required structure
  await exec(`DATABASE_URL=${connectionString} ${prismaBinary} migrate deploy`);
  // Regenerate client
  await exec(`DATABASE_URL=${connectionString} ${prismaBinary} generate`);
};

// afterAll(() => {
//   // disconnect Prisma from the database after all tests are complete
//   // to avoid open handles stopping Jest from exiting
//   prisma.$disconnect();
// });
