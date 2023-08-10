import { gql } from "graphql-request";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getDevices } from "../../../../test/helpers/device/getDevices";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
let sessionKey = "";

beforeAll(async () => {
  await deleteAllRecords();
  const result = await createUserWithWorkspace({
    username,
  });
  sessionKey = result.sessionKey;
});

test("all user devices", async () => {
  const authorizationHeader = sessionKey;
  const result = await getDevices({
    graphql,
    onlyNotExpired: true,
    authorizationHeader,
  });
  const edges = result.devices.edges;
  expect(edges.length).toBe(2);
});

test("only active sessions", async () => {
  const authorizationHeader = sessionKey;
  const result = await getDevices({
    graphql,
    onlyNotExpired: false,
    authorizationHeader,
  });
  const edges = result.devices.edges;
  expect(edges.length).toBe(1);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getDevices({
        graphql,
        onlyNotExpired: true,
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
      devices(onlyNotExpired: true, first: 501) {
        edges {
          node {
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
