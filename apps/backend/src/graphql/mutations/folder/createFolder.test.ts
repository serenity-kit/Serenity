import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createWorkspace } from "../../../../test/helpers/workspace/createWorkspace";
import { createFolder } from "../../../../test/helpers/folder/createFolder";

const graphql = setupGraphql();
const username = "user1";
const password = "password";
let isUserRegistered = false;
let addedWorkspace: any = null;

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
  }
});

test("user should be able to create a root folder", async () => {
  const authorizationHeader = `TODO+${username}`;
  const id = "c103a784-35cb-4aee-b366-d10398b6dd95";
  const parentFolderId = null;
  const result = await createFolder({
    graphql,
    id,
    parentFolderId,
    workspaceId: addedWorkspace.id,
    authorizationHeader,
  });
  expect(result.createFolder).toMatchInlineSnapshot(`
    Object {
      "folder": Object {
        "id": "c103a784-35cb-4aee-b366-d10398b6dd95",
        "name": "Untitled",
        "parentFolderId": null,
        "rootFolderId": null,
        "workspaceId": "5a3484e6-c46e-42ce-a285-088fc1fd6915",
      },
    }
  `);
});

test("user should be able to create a child folder", async () => {
  const authorizationHeader = `TODO+${username}`;
  const id = "c3d28056-b619-41c4-be51-ce89ed5b8be4";
  const parentFolderId = "c103a784-35cb-4aee-b366-d10398b6dd95";
  const result = await createFolder({
    graphql,
    id,
    parentFolderId,
    workspaceId: addedWorkspace.id,
    authorizationHeader,
  });
  expect(result.createFolder).toMatchInlineSnapshot(`
    Object {
      "folder": Object {
        "id": "c3d28056-b619-41c4-be51-ce89ed5b8be4",
        "name": "Untitled",
        "parentFolderId": "c103a784-35cb-4aee-b366-d10398b6dd95",
        "rootFolderId": null,
        "workspaceId": "5a3484e6-c46e-42ce-a285-088fc1fd6915",
      },
    }
  `);
});

test.skip("duplicate ID throws an error", async () => {
  const authorizationHeader = `TODO+${username}`;
  const id = "c103a784-35cb-4aee-b366-d10398b6dd95";
  const parentFolderId = null;
  const result = await createFolder({
    graphql,
    id,
    parentFolderId,
    workspaceId: addedWorkspace.id,
    authorizationHeader,
  });
  expect(result.createFolder).toMatchInlineSnapshot();
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id,
        parentFolderId,
        workspaceId: addedWorkspace.id,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Could not create folder");
});

test("Throw error when the parent folder doesn't exist", async () => {
  const authorizationHeader = `TODO+${username}`;
  const id = "92d85bfd-0970-48e2-80b0-f100789e1350";
  const parentFolderId = "badthing";
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id,
        parentFolderId,
        workspaceId: addedWorkspace.id,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Parent folder not found");
});

test("Throw error when user doesn't have access", async () => {
  // create a new user with access to different documents
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
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id: "1d283506-9de4-426b-8a02-567f0645dc31",
        parentFolderId: null,
        workspaceId: addedWorkspace.id,
        authorizationHeader: `TODO+${username}`,
      }))()
  ).rejects.toThrow("Unauthorized");
});
