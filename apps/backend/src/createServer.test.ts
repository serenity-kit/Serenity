import { folderDerivedKeyContext } from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import deleteAllRecords from "../test/helpers/deleteAllRecords";
import { decryptWorkspaceKey } from "../test/helpers/device/decryptWorkspaceKey";
import { createDocument } from "../test/helpers/document/createDocument";
import setupGraphql from "../test/helpers/setupGraphql";
import {
  createSocketClient,
  waitForClientState,
} from "../test/helpers/websocket";
import createUserWithWorkspace from "./database/testHelpers/createUserWithWorkspace";
import { Device } from "./types/device";

let server;

const graphql = setupGraphql();
const username = "59f80f08-c065-4acc-a542-2725fb2dff6c@example.com";
const workspaceId = "2d008bf8-87c4-4439-9b4b-9a0ec3919479";
const documentId = "72fbd941-42b7-4263-89fe-65bf43f455a7";
let userId: string | null = null;
let device: Device | null = null;
let sessionKey = "";
let workspaceKey = "";
let addedFolder: any = null;
let folderKey = "";
let addedWorkspace: any = null;

const setup = async () => {
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

  const createDocumentResponse = await createDocument({
    graphql,
    id: documentId,
    parentFolderId: addedFolder.parentFolderId,
    workspaceId,
    contentSubkeyId: 1,
    authorizationHeader: sessionKey,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("document not found if no id is provided", async () => {
  const { client, messages } = await createSocketClient(graphql.port, "", 1);
  await waitForClientState(client, client.CLOSED);
  expect(messages).toMatchInlineSnapshot(`
    [
      {
        "type": "documentNotFound",
      },
    ]
  `);
  expect(client.readyState).toEqual(client.CLOSED);
});

test("document not found if the document does not exist", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/id-that-does-not-exist`,
    1
  );
  await waitForClientState(client, client.CLOSED);
  expect(messages).toMatchInlineSnapshot(`
    [
      {
        "type": "documentNotFound",
      },
    ]
  `);
  expect(client.readyState).toEqual(client.CLOSED);
});

test("unauthorized if no valid session key is provided", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}`,
    1
  );
  await waitForClientState(client, client.CLOSED);
  expect(messages).toMatchInlineSnapshot(`
    [
      {
        "type": "unauthorized",
      },
    ]
  `);
  expect(client.readyState).toEqual(client.CLOSED);
});

test("successfully retrieves a document", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}?sessionKey=${sessionKey}`,
    1
  );
  await waitForClientState(client, client.CLOSED);
  expect(messages).toMatchInlineSnapshot(`
    [
      {
        "doc": {
          "id": "72fbd941-42b7-4263-89fe-65bf43f455a7",
          "parentFolderId": null,
          "workspaceId": "2d008bf8-87c4-4439-9b4b-9a0ec3919479",
          "workspaceKeyId": null,
        },
        "parentFolder": {},
        "snapshot": null,
        "type": "document",
        "updates": [],
      },
    ]
  `);
});
