import { deriveSessionAuthorization } from "@serenity-tools/common";
import deleteAllRecords from "../test/helpers/deleteAllRecords";
import setupGraphql from "../test/helpers/setupGraphql";
import createUserWithWorkspace from "./database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();

beforeAll(async () => {
  await deleteAllRecords();
});

test("disallow batched graphql queries", async () => {
  const username = "bb4b515f-b82e-4b37-ab1e-92f711790a25@example.com";
  const result = await createUserWithWorkspace({
    username,
  });
  const query1 = { query: "query {me{id}}" };
  const query2 = { query: "query {me{id, username}}" };

  // Send a batched request
  const response = await fetch(`http://localhost:${graphql.port}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: deriveSessionAuthorization({
        sessionKey: result.sessionKey,
      }).authorization,
    },
    body: JSON.stringify([query1, query2]),
  });

  expect(response.status).toBe(400);
});
