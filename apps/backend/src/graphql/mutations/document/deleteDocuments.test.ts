import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createWorkspace } from "../../../../test/helpers/workspace/createWorkspace";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { deleteDocuments } from "../../../../test/helpers/document/deleteDocuments";

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

test("user should be able to delete a document", async () => {
  const authorizationHeader = mainDeviceSigningPublicKey;
  const ids = [addedDocumentId];
  const result = await deleteDocuments({ graphql, ids, authorizationHeader });
  expect(result.deleteDocuments).toMatchInlineSnapshot(`
    Object {
      "status": "success",
    }
  `);
});

test("Deleting nonexistent document does nothing", async () => {
  const authorizationHeader = mainDeviceSigningPublicKey;
  const ids = ["badthing"];
  const result = await deleteDocuments({ graphql, ids, authorizationHeader });
  expect(result.deleteDocuments).toMatchInlineSnapshot(`
    Object {
      "status": "success",
    }
  `);
});
