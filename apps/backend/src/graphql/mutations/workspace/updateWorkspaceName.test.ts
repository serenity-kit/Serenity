import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { updateWorkspaceName } from "../../../../test/helpers/workspace/updateWorkspaceName";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password";
let user1Data: any = undefined;
let user2Data: any = undefined;

const setup = async () => {
  user1Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });

  user2Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user won't update the name when not set", async () => {
  const name = undefined;
  const result = await updateWorkspaceName({
    graphql,
    id: user1Data.workspace.id,
    name,
    authorizationHeader: user1Data.sessionKey,
  });
  const workspace = result.updateWorkspaceName.workspace;
  expect(workspace.name).toBe(user1Data.workspace.name);
});

test("user can change workspace name", async () => {
  const name = "renamed workspace";
  const result = await updateWorkspaceName({
    graphql,
    id: user1Data.workspace.id,
    name,
    authorizationHeader: user1Data.sessionKey,
  });
  const workspace = result.updateWorkspaceName.workspace;
  expect(workspace.name).toBe(name);
});

test("user should not be able to update a workspace they don't own", async () => {
  await expect(
    (async () =>
      await updateWorkspaceName({
        graphql,
        id: user1Data.workspace.id,
        name: "unauthorized workspace",
        authorizationHeader: user2Data.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("user should not be able to update a workspace for a workspace that doesn't exist", async () => {
  await expect(
    (async () =>
      await updateWorkspaceName({
        graphql,
        id: "non-existent-workspace-id",
        name: "nonexistant workspace",
        authorizationHeader: user1Data.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await updateWorkspaceName({
        graphql,
        id: user1Data.workspace.id,
        name: "unauthenticated workspace",
        authorizationHeader: "bad-session-key",
      }))()
  ).rejects.toThrow(/UNAUTHENTICATED/);
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
      authorization: user1Data.sessionKey,
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
      authorization: user1Data.sessionKey,
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
      authorization: user1Data.sessionKey,
    };
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
