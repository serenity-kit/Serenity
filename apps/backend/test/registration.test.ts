import { gql } from "graphql-request";
import setupGraphql from "./helpers/setupGraphql";

const graphql = setupGraphql();

beforeEach(async () => {
  // seed DB if necessary
});

test("should register a user", async () => {
  const query = gql`
    {
      test
    }
  `;

  const data = await graphql.client.request(query);
  expect(data).toMatchInlineSnapshot(`
    Object {
      "test": "test",
    }
  `);
});
