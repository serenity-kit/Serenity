import { GraphQLClient } from "graphql-request";
import createServer from "../../src/createServer";
import getPort, { portNumbers } from "./getPort";

export type TestContext = {
  client: GraphQLClient;
  port: number;
};

function createGraphqlTestContext() {
  let serverInstance: any | null = null;
  return {
    async before() {
      const port = await getPort({ port: portNumbers(4001, 6000) });
      const server = await createServer();
      serverInstance = await server.listen({ port });
      return {
        client: new GraphQLClient(`http://localhost:${port}/graphql`),
        port,
      };
    },
    async after() {
      serverInstance?.close();
    },
  };
}

export default function setupGraphql(): TestContext {
  let testContext = {} as TestContext;
  const graphqlCtx = createGraphqlTestContext();
  beforeAll(async () => {
    const { client, port } = await graphqlCtx.before();
    Object.assign(testContext, { client, port });
  });
  afterAll(async () => {
    await graphqlCtx.after();
  });
  return testContext;
}
