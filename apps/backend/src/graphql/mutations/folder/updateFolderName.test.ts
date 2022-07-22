import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { updateFolderName } from "../../../../test/helpers/folder/updateFolderName";
import { v4 as uuidv4 } from "uuid";

const graphql = setupGraphql();
const username = "user1";
const password = "password";
let sessionKey = "";
let addedWorkspace: any = null;
let addedFolderId: any = null;

const setup = async () => {
  const registerUserResult = await registerUser(graphql, username, password);
  sessionKey = registerUserResult.sessionKey;

  const createWorkspaceResult = await createInitialWorkspaceStructure({
    workspaceName: "workspace 1",
    workspaceId: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    folderName: "Getting started",
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey,
  });
  addedWorkspace =
    createWorkspaceResult.createInitialWorkspaceStructure.workspace;
  const createFolderResult = await createFolder({
    graphql,
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    name: null,
    parentFolderId: null,
    authorizationHeader: sessionKey,
    workspaceId: addedWorkspace.id,
  });
  addedFolderId = createFolderResult.createFolder.folder.id;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to change a folder name", async () => {
  const authorizationHeader = sessionKey;
  const id = addedFolderId;
  const name = "Updated Name";
  const result = await updateFolderName({
    graphql,
    id,
    name,
    authorizationHeader,
  });
  expect(result.updateFolderName).toMatchInlineSnapshot(`
    Object {
      "folder": Object {
        "id": "${addedFolderId}",
        "name": "${name}",
        "parentFolderId": null,
        "rootFolderId": null,
        "workspaceId": "5a3484e6-c46e-42ce-a285-088fc1fd6915",
      },
    }
  `);
});

test("throw error when folder doesn't exist", async () => {
  const authorizationHeader = sessionKey;
  const id = "badthing";
  const name = "Doesn't Exist Name";
  await expect(
    (async () =>
      await updateFolderName({
        graphql,
        id,
        name,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Folder not found");
});

test("throw error when user doesn't have access", async () => {
  // create a new user with access to different folders
  const username2 = "user2";
  const registerUserResult = await registerUser(graphql, username2, password);
  sessionKey = registerUserResult.sessionKey;
  const createWorkspaceResult = await createInitialWorkspaceStructure({
    workspaceName: "workspace 1",
    workspaceId: "95ad4e7a-f476-4bba-a650-8bb586d94ed3",
    folderName: "Getting started",
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: registerUserResult.sessionKey,
  });
  addedWorkspace =
    createWorkspaceResult.createInitialWorkspaceStructure.workspace;
  const otherUserFolderResult = await createFolder({
    graphql,
    id: "97a4c517-5ef2-4ea8-ac40-86a1e182bf23",
    name: null,
    parentFolderId: null,
    authorizationHeader: registerUserResult.sessionKey,
    workspaceId: addedWorkspace.id,
  });
  const authorizationHeader = sessionKey;
  const id = otherUserFolderResult.createFolder.id;
  const name = "Unauthorized Name";
  await expect(
    (async () =>
      await updateFolderName({
        graphql,
        id,
        name,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await updateFolderName({
        graphql,
        id: "97a4c517-5ef2-4ea8-ac40-86a1e182bf23",
        name: "renamed",
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
