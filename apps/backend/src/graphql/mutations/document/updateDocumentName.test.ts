import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { updateDocumentName } from "../../../../test/helpers/document/updateDocumentName";
import { v4 as uuidv4 } from "uuid";

const graphql = setupGraphql();
const username = "user1";
const password = "password";
let addedWorkspace: any = null;
let addedDocumentId: any = null;
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
  const createDocumentResult = await createDocument({
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    graphql,
    authorizationHeader: sessionKey,
    parentFolderId: null,
    workspaceId: addedWorkspace.id,
  });
  addedDocumentId = createDocumentResult.createDocument.id;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to change a document name", async () => {
  const authorizationHeader = sessionKey;
  const id = addedDocumentId;
  const name = "Updated Name";
  const result = await updateDocumentName({
    graphql,
    id,
    name,
    authorizationHeader,
  });
  expect(result.updateDocumentName).toMatchInlineSnapshot(`
    Object {
      "document": Object {
        "id": "5a3484e6-c46e-42ce-a285-088fc1fd6915",
        "name": "Updated Name",
      },
    }
  `);
});

test("Throw error when document doesn't exist", async () => {
  const authorizationHeader = sessionKey;
  const id = "badthing";
  const name = "Doesn't Exist Name";
  await expect(
    (async () =>
      await updateDocumentName({
        graphql,
        id,
        name,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Document not found");
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
  const otherUserDocumentResult = await createDocument({
    id: "97a4c517-5ef2-4ea8-ac40-86a1e182bf23",
    graphql,
    authorizationHeader: registerUserResult.sessionKey,
    parentFolderId: null,
    workspaceId: addedWorkspace.id,
  });
  const authorizationHeader = sessionKey;
  const id = otherUserDocumentResult.createDocument.id;
  const name = "Unauthorized Name";
  await expect(
    (async () =>
      await updateDocumentName({
        graphql,
        id,
        name,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  const id = addedDocumentId;
  const name = "Updated Name";
  await expect(
    (async () =>
      await updateDocumentName({
        graphql,
        id,
        name,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
