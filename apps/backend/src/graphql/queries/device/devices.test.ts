import { gql } from "graphql-request";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { createDevice } from "../../../../test/helpers/device/createDevice";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";

beforeAll(async () => {
  await deleteAllRecords();
  await createUserWithWorkspace({
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    username,
  });
});

test("user should be able to list their devices", async () => {
  const authorizationHeader = `TODO+${username}`;
  const authorizationHeaders = { authorization: authorizationHeader };
  await createDevice({
    graphql,
    authorizationHeader,
  });
  await createDevice({
    graphql,
    authorizationHeader,
  });

  // get root folders from graphql
  const query = gql`
    {
      devices(first: 50) {
        edges {
          node {
            userId
            signingPublicKey
            signingKeyType
            encryptionPublicKey
            encryptionKeyType
            encryptionPublicKeySignature
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    null,
    authorizationHeaders
  );
  const edges = result.devices.edges;
  expect(edges.length).toBe(3);
});
