import {
  decryptWorkspaceKey,
  folderDerivedKeyContext,
  generateId,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { getFolder } from "../../../../test/helpers/folder/getFolder";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
let workspaceId = "";
let sessionKey = "";
let workspaceKey = "";
let folderKey = "";
let addedFolder: any = null;
let addedWorkspace: any = null;

beforeAll(async () => {
  await deleteAllRecords();
  const result = await createUserWithWorkspace({
    username,
  });
  sessionKey = result.sessionKey;
  addedWorkspace = result.workspace;
  workspaceId = addedWorkspace.id;
  const workspaceKeyBox = addedWorkspace.currentWorkspaceKey?.workspaceKeyBox;
  workspaceKey = decryptWorkspaceKey({
    ciphertext: workspaceKeyBox?.ciphertext!,
    nonce: workspaceKeyBox?.nonce!,
    creatorDeviceEncryptionPublicKey: result.device.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: result.encryptionPrivateKey,
  });
  addedFolder = result.folder;
  const folderKeyResult = kdfDeriveFromKey({
    key: workspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: addedFolder.keyDerivationTrace.subkeyId,
  });
  folderKey = folderKeyResult.key;
});

test("user should be retrieve a folder", async () => {
  const authorizationHeader = sessionKey;
  const folderId = generateId();
  const folderName = "New folder";
  await createFolder({
    graphql,
    id: folderId,
    name: folderName,
    parentKey: workspaceKey,
    parentFolderId: null,
    workspaceId: workspaceId,
    authorizationHeader,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
  });
  const result = await getFolder({
    graphql,
    id: folderId,
    authorizationHeader,
  });
  const retrievedFolder = result.folder;
  expect(retrievedFolder.id).toBe(folderId);
  expect(retrievedFolder.parentFolderId).toBe(null);
  expect(retrievedFolder.workspaceId).toBe(workspaceId);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getFolder({
        graphql,
        id: generateId(),
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

test("Input Errors", async () => {
  await expect(
    (async () =>
      await getFolder({
        graphql,
        id: "",
        authorizationHeader: sessionKey,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});
