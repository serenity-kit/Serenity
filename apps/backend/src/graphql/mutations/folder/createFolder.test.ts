import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { v4 as uuidv4 } from "uuid";
import { gql } from "graphql-request";

const graphql = setupGraphql();
const username = "user1";
const password = "password";
let addedWorkspace: any = null;
let sessionKey = "";

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
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to create a root folder", async () => {
  const authorizationHeader = sessionKey;
  const id = "c103a784-35cb-4aee-b366-d10398b6dd95";
  const parentFolderId = null;
  const result = await createFolder({
    graphql,
    id,
    name: null,
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

test("user should be able to create a root folder with a name", async () => {
  const authorizationHeader = sessionKey;
  const id = "cb3e4195-40e2-45c0-8b87-8415abdc6b55";
  const parentFolderId = null;
  const result = await createFolder({
    graphql,
    id,
    name: "Named Folder",
    parentFolderId,
    workspaceId: addedWorkspace.id,
    authorizationHeader,
  });
  expect(result.createFolder).toMatchInlineSnapshot(`
    Object {
      "folder": Object {
        "id": "cb3e4195-40e2-45c0-8b87-8415abdc6b55",
        "name": "Named Folder",
        "parentFolderId": null,
        "rootFolderId": null,
        "workspaceId": "5a3484e6-c46e-42ce-a285-088fc1fd6915",
      },
    }
  `);
});

test("user should be able to create a child folder", async () => {
  const authorizationHeader = sessionKey;
  const id = "c3d28056-b619-41c4-be51-ce89ed5b8be4";
  const parentFolderId = "c103a784-35cb-4aee-b366-d10398b6dd95";
  const result = await createFolder({
    graphql,
    id,
    name: null,
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
        "rootFolderId": "c103a784-35cb-4aee-b366-d10398b6dd95",
        "workspaceId": "5a3484e6-c46e-42ce-a285-088fc1fd6915",
      },
    }
  `);
});

test.skip("duplicate ID throws an error", async () => {
  const authorizationHeader = sessionKey;
  const id = "c103a784-35cb-4aee-b366-d10398b6dd95";
  const parentFolderId = null;
  const result = await createFolder({
    graphql,
    id,
    name: null,
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
        name: null,
        parentFolderId,
        workspaceId: addedWorkspace.id,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Could not create folder");
});

test("Throw error when the parent folder doesn't exist", async () => {
  const authorizationHeader = sessionKey;
  const id = "92d85bfd-0970-48e2-80b0-f100789e1350";
  const parentFolderId = "badthing";
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id,
        name: null,
        parentFolderId,
        workspaceId: addedWorkspace.id,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Parent folder not found");
});

test("Throw error when user doesn't have access", async () => {
  // create a new user with access to different documents
  const username2 = "user2";
  const registerUserResult = await registerUser(graphql, username2, password);
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
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id: "1d283506-9de4-426b-8a02-567f0645dc31",
        name: null,
        parentFolderId: null,
        workspaceId: addedWorkspace.id,
        authorizationHeader: sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  const id = uuidv4();
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id,
        name: "test",
        parentFolderId: null,
        workspaceId: addedWorkspace.id,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: sessionKey,
  };
  test("Invalid id", async () => {
    const query = gql`
      mutation createFolder($input: CreateFolderInput!) {
        createFolder(input: $input) {
          folder {
            id
            name
            parentFolderId
            rootFolderId
            workspaceId
          }
        }
      }
    `;
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              id: null,
              name: "test",
              parentFolderId: null,
              workspaceId: addedWorkspace.id,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid workspaceId", async () => {
    const query = gql`
      mutation createFolder($input: CreateFolderInput!) {
        createFolder(input: $input) {
          folder {
            id
            name
            parentFolderId
            rootFolderId
            workspaceId
          }
        }
      }
    `;
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              id: "abc123",
              name: "test",
              parentFolderId: null,
              workspaceId: null,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    const query = gql`
      mutation createFolder($input: CreateFolderInput!) {
        createFolder(input: $input) {
          folder {
            id
            name
            parentFolderId
            rootFolderId
            workspaceId
          }
        }
      }
    `;
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: null,
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    const query = gql`
      mutation createFolder($input: CreateFolderInput!) {
        createFolder(input: $input) {
          folder {
            id
            name
            parentFolderId
            rootFolderId
            workspaceId
          }
        }
      }
    `;
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
