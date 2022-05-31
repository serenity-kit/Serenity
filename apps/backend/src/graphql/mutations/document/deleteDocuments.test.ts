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
    const createDocumentResult = await createDocument({
      id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
      graphql,
      authorizationHeader: `TODO+${username}`,
      parentFolderId: null,
      workspaceId: addedWorkspace.id,
    });
    addedDocumentId = createDocumentResult.createDocument.id;
  }
});

test("user should be able to delete a document", async () => {
  const authorizationHeader = `TODO+${username}`;
  const ids = [addedDocumentId];
  const result = await deleteDocuments({ graphql, ids, authorizationHeader });
  expect(result.deleteDocuments).toMatchInlineSnapshot(`
    Object {
      "status": "success",
    }
  `);
});

test("Deleting nonexistent document does nothing", async () => {
  const authorizationHeader = `TODO+${username}`;
  const ids = ["badthing"];
  const result = await deleteDocuments({ graphql, ids, authorizationHeader });
  expect(result.deleteDocuments).toMatchInlineSnapshot(`
    Object {
      "status": "success",
    }
  `);
});
