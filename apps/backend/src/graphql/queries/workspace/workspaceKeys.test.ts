import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { workspaceInvitations } from "../../../../test/helpers/workspace/workspaceInvitations";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { getWorkspace } from "../../../database/workspace/getWorkspace";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { prisma } from "../../../database/prisma";
import { v4 as uuidv4 } from "uuid";
import { getWorkspaceKeysForWorkspace } from "../../../../test/helpers/workspace/getWorkspaceKeysForWorkspace";
import { gql } from "graphql-request";

const graphql = setupGraphql();
const workspaceId = "workspace1";
const otherWorkspaceId = "otherWorkspace";
const user1Username = "inviter1@example.com";
const user2Username = "inviter2@example.com";
let userAndDevice1: any = null;
let userAndDevice2: any = null;

const setup = async () => {
  userAndDevice1 = await createUserWithWorkspace({
    id: workspaceId,
    username: user1Username,
  });
  userAndDevice2 = await createUserWithWorkspace({
    id: otherWorkspaceId,
    username: user2Username,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test.skip("test", async () => {
  const authorizationHeader = { authorization: userAndDevice1.sessionKey };
  const deviceSigningPublicKey = userAndDevice1.device.signingPublicKey;
  // get root folders from graphql
  const query = gql`
      {
          workspaceKeys(workspaceId: "${workspaceId}", deviceSigningPublicKey: "${deviceSigningPublicKey}", first: 50) {
              edges {
                  node {
                      id
                      workspaceId
                      generation
                      workspaceKeyBox {
                        id
                        deviceSigningPublicKey
                        ciphertext
                      }
                  }
              }
              pageInfo {
                  hasNextPage
                  endCursor
              }
          }
      }
      `;
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.workspaceKeys.edges).toMatchInlineSnapshot(`
    Array [
      Object {
        "node": Object {
          "generation": 0,
          "id": "5ffd2b45-4eaf-4ca6-8c8b-c2e7d1bb9f47",
          "workspaceId": "workspace1",
          "workspaceKeyBox": Object {
            "ciphertext": "CZtTS5se6uSQitjFw7C9Av90utDjQa9fiENMaURMRhZzKNIUS6SLofona2jlrvyOOr3cRG-UROVuVpZ2dtBjVRavDgDww3n3WU9U4bbIq6M",
            "deviceSigningPublicKey": "MSSx0soqZucJRimjbG1r24EsXo9xizxWMozw2VnnV_s",
            "id": "c6abfd79-0c34-475d-b8c0-6424f4b06bdb",
          },
        },
      },
    ]
  `);
});

test("one workspaceKey for a workspace", async () => {
  const workspaceKeysResult = await getWorkspaceKeysForWorkspace({
    graphql,
    authorizationHeader: userAndDevice1.sessionKey,
    workspaceId,
    deviceSigningPublicKey: userAndDevice1.device.signingPublicKey,
    first: 500,
  });
  const workspaceKeys = workspaceKeysResult.workspaceKeys.edges;
  expect(workspaceKeys.length).toBe(1);
});

test("should throw an error if we try to fetch more than 500", async () => {
  await expect(
    (async () =>
      await getWorkspaceKeysForWorkspace({
        graphql,
        authorizationHeader: userAndDevice1.sessionKey,
        workspaceId,
        deviceSigningPublicKey: userAndDevice1.device.signingPublicKey,
        first: 501,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("bad authorization header throws error", async () => {
  await expect(
    (async () =>
      await getWorkspaceKeysForWorkspace({
        graphql,
        authorizationHeader: userAndDevice2.sessionKey,
        workspaceId: workspaceId,
        deviceSigningPublicKey: userAndDevice1.device.signingPublicKey,
        first: 500,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

// TODO: after we have the ability to create new workspaceKeys
// we should test the pagination features of this query
