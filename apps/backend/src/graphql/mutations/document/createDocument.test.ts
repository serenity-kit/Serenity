import {
  createDocumentKey,
  folderDerivedKeyContext,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";

const graphql = setupGraphql();
const username = "user1";
const password = "password";
let userData: any = null;
let addedWorkspace: any = null;
let addedDocumentId: any = null;
let addedFolder: any = null;
let sessionKey = "";

const setup = async () => {
  userData = await registerUser(graphql, username, password);
  sessionKey = userData.sessionKey;
  const device = userData.mainDevice;
  const createWorkspaceResult = await createInitialWorkspaceStructure({
    workspaceName: "workspace 1",
    workspaceId: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    deviceSigningPublicKey: device.signingPublicKey,
    deviceEncryptionPublicKey: device.encryptionPublicKey,
    deviceEncryptionPrivateKey: userData.encryptionPrivateKey,
    webDevice: userData.webDevice,
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
  addedFolder = createWorkspaceResult.createInitialWorkspaceStructure.folder;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to create a document", async () => {
  const id = uuidv4();
  const workspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: userData.mainDevice,
    deviceEncryptionPrivateKey: userData.encryptionPrivateKey,
    workspace: addedWorkspace,
  });
  const folderKeyResult = await kdfDeriveFromKey({
    key: workspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: addedFolder.subkeyId,
  });
  let documentContentKeyResult = await createDocumentKey({
    folderKey: folderKeyResult.key,
  });
  const result = await createDocument({
    id,
    graphql,
    authorizationHeader: sessionKey,
    parentFolderId: null,
    workspaceId: addedWorkspace.id,
    contentSubkeyId: documentContentKeyResult.subkeyId,
  });
  expect(result.createDocument.id).toBe(id);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await createDocument({
        id: uuidv4(),
        graphql,
        authorizationHeader: "badauthkey",
        parentFolderId: null,
        contentSubkeyId: 1,
        workspaceId: addedWorkspace.id,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: sessionKey,
  };
  const id = uuidv4();
  const query = gql`
    mutation createDocument($input: CreateDocumentInput!) {
      createDocument(input: $input) {
        id
      }
    }
  `;
  test("Invalid Id", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              id: null,
              parentFolderId: null,
              workspaceId: addedWorkspace.id,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid workspaceId", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              id: uuidv4,
              parentFolderId: null,
              workspaceId: null,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
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
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
