import { gql } from "graphql-request";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { v4 as uuidv4 } from "uuid";

const graphql = setupGraphql();
const username = "591e6e60-8a85-41fa-9ec8-33fdca675a2a@example.com";
const password = "password";
let didRegisterUser = false;
let sessionKey = "";

beforeAll(async () => {
  await deleteAllRecords();
});

const workspaceId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const parentFolderId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const folderId = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const otherFolderId = "c1c65251-7471-4893-a1b5-e3df937caf66";
const documentId1 = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const documentId2 = "9e911f29-7a86-480b-89d7-5c647f21317f";
const childDocumentId = "929ca262-f144-40f7-8fe2-d3147f415f26";

const query = gql`
  query firstDocument($workspaceId: ID!) {
    firstDocument(workspaceId: $workspaceId) {
      id
    }
  }
`;

beforeEach(async () => {
  // TODO: we don't want this before every test
  if (!didRegisterUser) {
    const registerUserResult = await registerUser(graphql, username, password);
    sessionKey = registerUserResult.sessionKey;

    await createInitialWorkspaceStructure({
      workspaceName: "workspace 1",
      workspaceId: workspaceId,
      folderName: "Getting started",
      folderId: uuidv4(),
      folderIdSignature: `TODO+${uuidv4()}`,
      documentName: "Introduction",
      documentId: uuidv4(),
      graphql,
      authorizationHeader: sessionKey,
    });
    const createParentFolderResult = await createFolder({
      graphql,
      id: parentFolderId,
      name: null,
      parentFolderId: null,
      authorizationHeader: sessionKey,
      workspaceId: workspaceId,
    });
    const createFolderResult = await createFolder({
      graphql,
      id: folderId,
      name: null,
      parentFolderId: parentFolderId,
      authorizationHeader: sessionKey,
      workspaceId: workspaceId,
    });
    didRegisterUser = true;
  }
});

test("user should be able to retrieve the first document", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const result = await graphql.client.request(
    query,
    { workspaceId },
    authorizationHeader
  );
  expect(result.documents).toMatchInlineSnapshot(`undefined`);
});

test("user should not be able to retreive the first document from another workspace", async () => {
  const registerUserResult2 = await registerUser(
    graphql,
    "abddee2d-3a00-4b3f-b893-85c0e67feb9e@example.com",
    password
  );

  const authorizationHeader = {
    authorization: registerUserResult2.sessionKey,
  };
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        { workspaceId },
        authorizationHeader
      ))()
  ).rejects.toThrow("Unauthorized");
});
