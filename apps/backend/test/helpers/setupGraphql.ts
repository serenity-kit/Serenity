import { GraphQLClient } from "graphql-request";
import getPort, { portNumbers } from "./getPort";
import createServer from "../../src/createServer";

type TestContext = {
  client: GraphQLClient;
};

function graphqlTestContext() {
  let serverInstance: any | null = null;
  return {
    async before() {
      const port = await getPort({ port: portNumbers(4001, 6000) });
      const server = await createServer();
      serverInstance = await server.listen({ port });
      return new GraphQLClient(`http://localhost:${port}/graphql`);
    },
    async after() {
      serverInstance?.close();
    },
  };
}

export default function setupGraphql(): TestContext {
  let testContext = {} as TestContext;
  const graphqlCtx = graphqlTestContext();
  beforeAll(async () => {
    const client = await graphqlCtx.before();
    Object.assign(testContext, { client });
  });
  afterAll(async () => {
    await graphqlCtx.after();
  });
  return testContext;
}
