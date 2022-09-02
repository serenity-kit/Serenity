import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { updateWorkspace } from "../../../../test/helpers/workspace/updateWorkspace";

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
  const members = [
    {
      userId: userId1,
      isAdmin: true,
    },
    {
      userId: userId2,
      isAdmin: true,
    },
  ];
  const result = await updateWorkspace({
    graphql,
    id,
    name,
    members,
    authorizationHeader,
  });
  const workspace = result.updateWorkspace.workspace;
  expect(workspace.name).toBe(addedWorkspace.name);
  expect(workspace.members.length).toBe(2);
  workspace.members.forEach((member: { userId: string; isAdmin: any }) => {
    expect(member.isAdmin).toBe(true);
  });
});

test("user won't update the members", async () => {
  // generate a challenge code
  const authorizationHeader = sessionKey1;
  const id = "abc";
  const name = "workspace 2";
  const members = undefined;
  const result = await updateWorkspace({
    graphql,
    id,
    name,
    members,
    authorizationHeader,
  });
  const workspace = result.updateWorkspace.workspace;
  expect(workspace.members.length).toBe(2);
});

// WARNING: after this, user is no longer an admin on this workspace
test("user should be able to update a workspace, but not their own access level", async () => {
  // generate a challenge code
  const authorizationHeader = sessionKey1;
  const id = "abc";
  const name = "renamed workspace";
  const members = [
    {
      userId: userId1,
      isAdmin: false,
    },
    {
      userId: userId2,
      isAdmin: false,
    },
  ];
  const result = await updateWorkspace({
    graphql,
    id,
    name,
    members,
    authorizationHeader,
  });
  const workspace = result.updateWorkspace.workspace;
  expect(workspace.name).toBe(name);
  expect(workspace.members.length).toBe(2);
  workspace.members.forEach((member: { userId: string; isAdmin: any }) => {
    if (member.userId === userId1) {
      expect(member.isAdmin).toBe(true);
    } else {
      expect(member.isAdmin).toBe(false);
    }
  });
});

test("user should not be able to update a workspace they don't own", async () => {
  // generate a challenge code
  const authorizationHeader = sessionKey2;
  const id = "abc";
  const name = "unauthorized workspace";
  const members = [
    {
      userId: userId1,
      isAdmin: true,
    },
    {
      userId: userId2,
      isAdmin: true,
    },
  ];
  await expect(
    (async () =>
      await updateWorkspace({
        graphql,
        id,
        name,
        members,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("user should not be able to update a workspace for a workspace that doesn't exist", async () => {
  // generate a challenge code
  const authorizationHeader = sessionKey1;
  const id = "hahahaha";
  const name = "nonexistent workspace";
  const members = [
    {
      userId: userId1,
      isAdmin: false,
    },
    {
      userId: userId2,
      isAdmin: true,
    },
  ];
  await expect(
    (async () =>
      await updateWorkspace({
        graphql,
        id,
        name,
        members,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  const id = addedWorkspace.id;
  const name = "unautharized workspace";
  const members = [
    {
      userId: userId1,
      isAdmin: false,
    },
  ];
  await expect(
    (async () =>
      await updateWorkspace({
        graphql,
        id,
        name,
        members,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const query = gql`
    mutation updateWorkspace($input: UpdateWorkspaceInput!) {
      updateWorkspace(input: $input) {
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
    const members = [
      {
        userId: userId1,
        isAdmin: false,
      },
    ];
    const authorizationHeaders = {
      authorization: sessionKey1,
    };
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          { input: { id: null, name, members } },
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
