import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createWorkspace } from "../../../../test/helpers/workspace/createWorkspace";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { updateFolderName } from "../../../../test/helpers/folder/updateFolderName";

const graphql = setupGraphql();
const username = "user1";
const password = "password";
let isUserRegistered = false;
let addedWorkspace: any = null;
let addedFolderId: any = null;

beforeAll(async () => {
  await deleteAllRecords();
});

beforeEach(async () => {
  // TODO: we don't want this before every test
  if (!isUserRegistered) {
    await registerUser(
      graphql,
      username,
      password,
      "9c22b47e-3d5e-4aae-a0b2-7e6f8974e7e2"
    );
    isUserRegistered = true;
    const createWorkspaceResult = await createWorkspace({
      name: "workspace 1",
      id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
      graphql,
      authorizationHeader: `TODO+${username}`,
    });
    addedWorkspace = createWorkspaceResult.createWorkspace.workspace;
    const createFolderResult = await createFolder({
      graphql,
      id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
      name: null,
      parentFolderId: null,
      authorizationHeader: `TODO+${username}`,
      workspaceId: addedWorkspace.id,
    });
    addedFolderId = createFolderResult.createFolder.folder.id;
  }
});

test("user should be able to change a folder name", async () => {
  const authorizationHeader = `TODO+${username}`;
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
  const authorizationHeader = `TODO+${username}`;
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
  await registerUser(
    graphql,
    username2,
    password,
    "7d84fd9b-cf52-4ab5-991e-b2b0a830c51b"
  );
  isUserRegistered = true;
  const createWorkspaceResult = await createWorkspace({
    name: "workspace 1",
    id: "95ad4e7a-f476-4bba-a650-8bb586d94ed3",
    graphql,
    authorizationHeader: `TODO+${username2}`,
  });
  addedWorkspace = createWorkspaceResult.createWorkspace.workspace;
  const otherUserFolderResult = await createFolder({
    graphql,
    id: "97a4c517-5ef2-4ea8-ac40-86a1e182bf23",
    name: null,
    parentFolderId: null,
    authorizationHeader: `TODO+${username2}`,
    workspaceId: addedWorkspace.id,
  });
  const authorizationHeader = `TODO+${username}`;
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
