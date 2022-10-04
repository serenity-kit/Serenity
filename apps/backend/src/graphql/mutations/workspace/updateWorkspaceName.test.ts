import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { updateWorkspaceName } from "../../../../test/helpers/workspace/updateWorkspaceName";

const graphql = setupGraphql();
let userId1 = "";
const username = "user";
let userId2 = "";
const username2 = "user1";
const password = "password";
let addedWorkspace: any = null;
let sessionKey1 = "";
let sessionKey2 = "";

const setup = async () => {
  const registerUserResult1 = await registerUser(graphql, username, password);
  sessionKey1 = registerUserResult1.sessionKey;
  userId1 = registerUserResult1.userId;
  const device = registerUserResult1.mainDevice;
  const registerUserResult2 = await registerUser(graphql, username2, password);
  sessionKey2 = registerUserResult2.sessionKey;
  userId2 = registerUserResult2.userId;

  const createWorkspaceResult = await createInitialWorkspaceStructure({
    workspaceName: "workspace 1",
    workspaceId: "abc",
    deviceSigningPublicKey: device.signingPublicKey,
    deviceEncryptionPublicKey: device.encryptionPublicKey,
    deviceEncryptionPrivateKey: registerUserResult1.encryptionPrivateKey,
    folderName: "Getting started",
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey1,
  });
  addedWorkspace =
    createWorkspaceResult.createInitialWorkspaceStructure.workspace;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user won't update the name when not set", async () => {
  // generate a challenge code
  const authorizationHeader = sessionKey1;
  const id = "abc";
  const name = undefined;
  const result = await updateWorkspaceName({
    graphql,
    id,
    name,
    authorizationHeader,
  });
  const workspace = result.updateWorkspaceName.workspace;
  expect(workspace.name).toBe(addedWorkspace.name);
});

test("user can change workspace name", async () => {
  // generate a challenge code
  const authorizationHeader = sessionKey1;
  const id = "abc";
  const name = "workspace 2";
  const result = await updateWorkspaceName({
    graphql,
    id,
    name,
    authorizationHeader,
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
  const id = addedWorkspace.id;
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
            isAdmin
          }
        }
      }
    }
  `;
  test("Invalid id", async () => {
    const id = addedWorkspace.id;
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
