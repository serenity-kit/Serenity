import {
  decryptDocumentTitle,
  folderDerivedKeyContext,
  recreateDocumentKey,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { decryptWorkspaceKey } from "../../../../test/helpers/device/decryptWorkspaceKey";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { getDocument } from "../../../../test/helpers/document/getDocument";
import { updateDocumentName } from "../../../../test/helpers/document/updateDocumentName";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { Device } from "../../../types/device";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const workspaceId = "5a3484e6-c46e-42ce-a285-088fc1fd6915";
let userId: string | null = null;
let device: Device | null = null;
let sessionKey = "";
let workspaceKey = "";
let addedFolder: any = null;
let folderKey = "";

const setup = async () => {
  const result = await createUserWithWorkspace({
    id: workspaceId,
    username,
  });
  userId = result.user.id;
  device = result.device;
  sessionKey = result.sessionKey;
  const addedWorkspace = result.workspace;
  const workspaceKeyBox = addedWorkspace.currentWorkspaceKey?.workspaceKeyBox;
  workspaceKey = await decryptWorkspaceKey({
    ciphertext: workspaceKeyBox?.ciphertext!,
    nonce: workspaceKeyBox?.nonce!,
    creatorDeviceEncryptionPublicKey: result.device.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: result.encryptionPrivateKey,
  });
  addedFolder = result.folder;
  const folderKeyResult = await kdfDeriveFromKey({
    key: workspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: addedFolder.subKeyId,
  });
  folderKey = folderKeyResult.key;
};
beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be retrieve a document", async () => {
  const authorizationHeader = sessionKey;
  const documentId = uuidv4();
  const documentName = "Test document";
  const createDocumentResponse = await createDocument({
    graphql,
    id: documentId,
    parentFolderId: null,
    workspaceId: workspaceId,
    authorizationHeader,
  });
  await updateDocumentName({
    graphql,
    id: documentId,
    name: documentName,
    folderKey,
    authorizationHeader,
  });

  // const createdDocument = createDocumentResponse.createDevice.document;

  const result = await getDocument({
    graphql,
    id: documentId,
    authorizationHeader,
  });
  const retrievedDocument = result.document;
  expect(retrievedDocument.id).toBe(documentId);
  expect(retrievedDocument.name).toBe(documentName);
  expect(retrievedDocument.workspaceId).toBe(workspaceId);
  expect(retrievedDocument.parentFolderId).toBe(null);
  expect(typeof retrievedDocument.encryptedName).toBe("string");
  expect(typeof retrievedDocument.encryptedNameNonce).toBe("string");
  expect(typeof retrievedDocument.subkeyId).toBe("number");

  expect(typeof retrievedDocument.encryptedName).toBe("string");
  expect(typeof retrievedDocument.encryptedNameNonce).toBe("string");
  expect(typeof retrievedDocument.subkeyId).toBe("number");
  const documentSubkey = await recreateDocumentKey({
    folderKey,
    subkeyId: retrievedDocument.subkeyId,
  });
  const decryptedName = await decryptDocumentTitle({
    key: documentSubkey.key,
    ciphertext: retrievedDocument.encryptedName,
    publicNonce: retrievedDocument.encryptedNameNonce,
    publicData: null,
  });
  expect(decryptedName).toBe(documentName);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getDocument({
        graphql,
        id: uuidv4(),
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

test("Input Errors", async () => {
  await expect(
    (async () =>
      await getDocument({
        graphql,
        id: "",
        authorizationHeader: sessionKey,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});
