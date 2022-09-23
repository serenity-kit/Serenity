import { folderDerivedKeyContext } from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { decryptWorkspaceKey } from "../../../../test/helpers/device/decryptWorkspaceKey";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { getFolder } from "../../../../test/helpers/folder/getFolder";
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
let folderKey = "";
let addedFolder: any = null;
let addedWorkspace: any = null;

beforeAll(async () => {
  await deleteAllRecords();
  const result = await createUserWithWorkspace({
    id: workspaceId,
    username,
  });
  userId = result.user.id;
  device = result.device;
  sessionKey = result.sessionKey;
  addedWorkspace = result.workspace;
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
    subkeyId: addedFolder.subkeyId,
  });
  folderKey = folderKeyResult.key;
});

test("user should be retrieve a folder", async () => {
  const authorizationHeader = sessionKey;
  const folderId = uuidv4();
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
        id: uuidv4(),
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
