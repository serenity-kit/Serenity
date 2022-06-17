import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createWorkspace } from "../../../../test/helpers/workspace/createWorkspace";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { updateDocumentName } from "../../../../test/helpers/document/updateDocumentName";

const graphql = setupGraphql();
const username = "user1";
const password = "password";
let isUserRegistered = false;
let addedWorkspace: any = null;
let addedDocumentId: any = null;
let mainDeviceSigningPublicKey = "";

beforeAll(async () => {
  await deleteAllRecords();
});

beforeEach(async () => {
  // TODO: we don't want this before every test
  if (!isUserRegistered) {
    const registerUserResult = await registerUser(graphql, username, password);
    mainDeviceSigningPublicKey = registerUserResult.mainDeviceSigningPublicKey;
    isUserRegistered = true;
    const createWorkspaceResult = await createWorkspace({
      name: "workspace 1",
      id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
      graphql,
      authorizationHeader: mainDeviceSigningPublicKey,
    });
    addedWorkspace = createWorkspaceResult.createWorkspace.workspace;
    const createDocumentResult = await createDocument({
      id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
      graphql,
      authorizationHeader: mainDeviceSigningPublicKey,
      parentFolderId: null,
      workspaceId: addedWorkspace.id,
    });
    addedDocumentId = createDocumentResult.createDocument.id;
  }
});

test("user should be able to change a document name", async () => {
  const authorizationHeader = mainDeviceSigningPublicKey;
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
  const authorizationHeader = mainDeviceSigningPublicKey;
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

  isUserRegistered = true;
  const createWorkspaceResult = await createWorkspace({
    name: "workspace 1",
    id: "95ad4e7a-f476-4bba-a650-8bb586d94ed3",
    graphql,
    authorizationHeader: registerUserResult.mainDeviceSigningPublicKey,
  });
  addedWorkspace = createWorkspaceResult.createWorkspace.workspace;
  const otherUserDocumentResult = await createDocument({
    id: "97a4c517-5ef2-4ea8-ac40-86a1e182bf23",
    graphql,
    authorizationHeader: registerUserResult.mainDeviceSigningPublicKey,
    parentFolderId: null,
    workspaceId: addedWorkspace.id,
  });
  const authorizationHeader = mainDeviceSigningPublicKey;
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
