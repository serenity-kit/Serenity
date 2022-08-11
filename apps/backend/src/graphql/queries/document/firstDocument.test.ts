import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";

const graphql = setupGraphql();
const username = "591e6e60-8a85-41fa-9ec8-33fdca675a2a@example.com";
const password = "password";
let didRegisterUser = false;
let sessionKey = "";
let workspaceKey = "";

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

const setup = async () => {
  const registerUserResult = await registerUser(graphql, username, password);
  sessionKey = registerUserResult.sessionKey;
  const device = registerUserResult.mainDevice;
  const initialWorkspaceStructureResult = await createInitialWorkspaceStructure(
    {
      workspaceName: "workspace 1",
      workspaceId: workspaceId,
      deviceSigningPublicKey: device.signingPublicKey,
      deviceEncryptionPublicKey: device.encryptionPublicKey,
      deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
      folderName: "Getting started",
      folderId: uuidv4(),
      folderIdSignature: `TODO+${uuidv4()}`,
      documentName: "Introduction",
      documentId: uuidv4(),
      graphql,
      authorizationHeader: sessionKey,
    }
  );

  workspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: registerUserResult.mainDevice,
    deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
    workspace:
      initialWorkspaceStructureResult.createInitialWorkspaceStructure.workspace,
  });
  const parentFolderName = "parent folder";
  const folderName = "folder";
  const createParentFolderResult = await createFolder({
    graphql,
    id: parentFolderId,
    name: parentFolderName,
    parentFolderId: null,
    parentKey: workspaceKey,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
  });
  const createFolderResult = await createFolder({
    graphql,
    id: folderId,
    name: folderName,
    parentFolderId: parentFolderId,
    parentKey: workspaceKey,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
  });
  didRegisterUser = true;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
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

test("Unauthenticated", async () => {
  const authorizationHeader = { authorization: "badauthheader" };
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        { workspaceId },
        authorizationHeader
      ))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

test("Input Errors", async () => {
  const authorizationHeader = { authorization: sessionKey };
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
