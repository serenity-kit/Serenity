import { gql } from "graphql-request";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { v4 as uuidv4 } from "uuid";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const password = "password";
let sessionKey = "";

const workspace1Id = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const workspace2Id = "a0856379-ad08-4dc5-baf5-ab93c9f7b5e5";

const setup = async () => {
  const registerUserResult = await registerUser(graphql, username, password);
  sessionKey = registerUserResult.sessionKey;
  await createInitialWorkspaceStructure({
    workspaceName: "workspace 1",
    workspaceId: workspace1Id,
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    folderName: "Getting started",
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey,
  });
  await createInitialWorkspaceStructure({
    workspaceName: "workspace 2",
    workspaceId: workspace2Id,
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    folderName: "Getting started",
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to get a workspace by id", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const query = gql`
    query workspace($id: ID) {
      workspace(id: $id) {
        id
        name
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { id: workspace2Id },
    authorizationHeader
  );
  expect(result.workspace).toMatchInlineSnapshot(`
    Object {
      "id": "a0856379-ad08-4dc5-baf5-ab93c9f7b5e5",
      "name": "workspace 2",
    }
  `);
});

test("user should get a workspace without providing an id", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const query = gql`
    query workspace {
      workspace {
        id
        name
      }
    }
  `;
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.workspace).toMatchInlineSnapshot(`
    Object {
      "id": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
      "name": "workspace 1",
    }
  `);
});
