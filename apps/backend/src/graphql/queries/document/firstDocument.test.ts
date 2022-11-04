import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let user1Data: any = undefined;
const password = "password";

let user1WorkspaceKey = "";

const parentFolderId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const folderId = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";

const query = gql`
  query firstDocument($workspaceId: ID!) {
    firstDocument(workspaceId: $workspaceId) {
      id
    }
  }
`;

const setup = async () => {
  user1Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  user1WorkspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: user1Data.device,
    deviceEncryptionPrivateKey: user1Data.encryptionPrivateKey,
    workspace: user1Data.workspace,
  });
  const parentFolderName = "parent folder";
  const folderName = "folder";
  const createParentFolderResult = await createFolder({
    graphql,
    id: parentFolderId,
    name: parentFolderName,
    parentFolderId: null,
    parentKey: user1WorkspaceKey,
    authorizationHeader: user1Data.sessionKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
  });
  const createFolderResult = await createFolder({
    graphql,
    id: folderId,
    name: folderName,
    parentFolderId: parentFolderId,
    parentKey: user1WorkspaceKey,
    authorizationHeader: user1Data.sessionKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to retrieve the first document", async () => {
  const authorizationHeader = { authorization: user1Data.sessionKey };
  const result = await graphql.client.request(
    query,
    { workspaceId: user1Data.workspace.id },
    authorizationHeader
  );
  const firstDocument = result.firstDocument;
  expect(firstDocument.id).toBe(user1Data.document.id);
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
        { workspaceId: user1Data.workspace.id },
        authorizationHeader
      ))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  const authorizationHeader = { authorization: "badauthheader" };
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        { workspaceId: user1Data.workspace.id },
        authorizationHeader
      ))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

test("Input Errors", async () => {
  const authorizationHeader = { authorization: user1Data.sessionKey };
  await expect(
    (async () =>
      await graphql.client.request(query, null, authorizationHeader))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        { workspaceId: null },
        authorizationHeader
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});
