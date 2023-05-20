import { generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { updateWorkspaceName } from "../../../../test/helpers/workspace/updateWorkspaceName";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
let userData2: any = undefined;
let userId1 = "";
const username = "user";
let userId2 = "";
const username2 = "user1";
const password = "password";
let sessionKey1 = "";
let sessionKey2 = "";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: generateId(),
    username: `${generateId()}@example.com`,
    password,
  });
  sessionKey1 = userData1.sessionKey;
  userId1 = userData1.user.id;

  userData2 = await createUserWithWorkspace({
    id: generateId(),
    username: `${generateId()}@example.com`,
    password,
  });
  sessionKey2 = userData1.sessionKey;
  userId2 = userData1.user.id;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user won't update the name when not set", async () => {
  const name = undefined;
  const result = await updateWorkspaceName({
    graphql,
    id: userData1.workspace.id,
    name,
    authorizationHeader: userData1.sessionKey,
  });
  const workspace = result.updateWorkspaceName.workspace;
  expect(workspace.name).toBe(userData1.workspace.name);
});

test("user can change workspace name", async () => {
  const name = "workspace 2";
  const result = await updateWorkspaceName({
    graphql,
    id: userData1.workspace.id,
    name,
    authorizationHeader: userData1.sessionKey,
  });
  const workspace = result.updateWorkspaceName.workspace;
  expect(workspace.name).toBe(name);
});

test("user should not be able to update a workspace they don't own", async () => {
  // generate a challenge code
  const authorizationHeader = sessionKey2;
  const id = "abc";
  const name = "unauthorized workspace";
  await expect(
    (async () =>
      await updateWorkspaceName({
        graphql,
        id,
        name,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("user should not be able to update a workspace for a workspace that doesn't exist", async () => {
  // generate a challenge code
  const authorizationHeader = sessionKey1;
  const id = "hahahaha";
  const name = "nonexistent workspace";
  await expect(
    (async () =>
      await updateWorkspaceName({
        graphql,
        id,
        name,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  const id = userData1.workspace.id;
  const name = "unautharized workspace";
  await expect(
    (async () =>
      await updateWorkspaceName({
        graphql,
        id,
        name,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const query = gql`
    mutation updateWorkspaceName($input: UpdateWorkspaceNameInput!) {
      updateWorkspaceName(input: $input) {
        workspace {
          id
          name
          members {
            userId
            role
          }
        }
      }
    }
  `;
  test("Invalid id", async () => {
    const name = undefined;
    const authorizationHeaders = {
      authorization: sessionKey1,
    };
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          { input: { id: null, name } },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    const authorizationHeaders = {
      authorization: sessionKey1,
    };
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          { input: null },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    const authorizationHeaders = {
      authorization: sessionKey1,
    };
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
