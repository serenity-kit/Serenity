import { gql } from "graphql-request";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { createDevice } from "../../../../test/helpers/device/createDevice";
import { getDevices } from "../../../../test/helpers/device/getDevices";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
let sessionKey = "";

beforeAll(async () => {
  await deleteAllRecords();
  const result = await createUserWithWorkspace({
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    username,
  });
  sessionKey = result.sessionKey;
});

test("user should be able to list their devices", async () => {
  const authorizationHeader = sessionKey;
  await createDevice({
    graphql,
    authorizationHeader,
  });
  await createDevice({
    graphql,
    authorizationHeader,
  });

  const result = await getDevices({
    graphql,
    authorizationHeader,
  });

  const edges = result.devices.edges;
  expect(edges.length).toBe(3);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getDevices({
        graphql,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

test("Input Errors", async () => {
  const authorizationHeaders = {
    authorization: sessionKey,
  };

  // get root folders from graphql
  const query = gql`
    {
      devices(first: 51) {
        edges {
          node {
            userId
            signingPublicKey
            encryptionPublicKey
            encryptionPublicKeySignature
            info
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
  await expect(
    (async () =>
      await graphql.client.request(query, null, authorizationHeaders))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});
