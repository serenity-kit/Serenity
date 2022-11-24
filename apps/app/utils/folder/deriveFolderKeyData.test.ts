jest.mock("../../generated/graphql", () => ({ __esModule: true }));
jest.mock("./getFolder", () => ({
  __esModule: true,
  getFolder: jest.fn(),
}));
jest.mock("../workspace/getWorkspace", () => ({
  __esModule: true,
  getWorkspace: jest.fn(),
}));

import { createDevice } from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";
import { v4 as uuidv4 } from "uuid";
import { createAndEncryptWorkspaceKeyForDevice } from "../device/createAndEncryptWorkspaceKeyForDevice";
import { getWorkspace } from "../workspace/getWorkspace";
import { deriveFolderKey } from "./deriveFolderKeyData";
import { getFolder } from "./getFolder";

beforeAll(async () => {
  await sodium.ready;
});

it("should return empty parentFolders", async () => {
  const activeDevice = await createDevice();
  const workspaceId = uuidv4();
  const workspaceKeyId = uuidv4();
  const folderId = uuidv4();
  const workspaceKeyString = await sodium.crypto_kdf_keygen();
  const workspaceKeyData = await createAndEncryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: activeDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey,
    workspaceKey: workspaceKeyString,
  });
  const workspaceKey = {
    __typename: "WorkspaceKey",
    id: workspaceKeyId,
    workspaceKeyBox: {
      __typename: "WorkspaceKeyBox",
      id: uuidv4(),
      ciphertext: workspaceKeyData.ciphertext,
      nonce: workspaceKeyData.nonce,
      deviceSigningPublicKey: "abc",
      creatorDevice: {
        __typename: "Device",
        id: uuidv4(),
        signingPublicKey: activeDevice.signingPublicKey,
        encryptionPublicKey: activeDevice.encryptionPublicKey,
      },
    },
  };
  // @ts-ignore getWorkspace is mocked
  getWorkspace.mockImplementation((props) => {
    return {
      __typename: "Workspace",
      id: workspaceId,
      currentWorkspaceKey: workspaceKey,
      workspaceKeys: [workspaceKey],
    };
  });

  // @ts-ignore getFolder is mocked
  getFolder.mockImplementation((props) => {
    return {
      __typename: "Folder",
      id: folderId,
      encryptedName: "aaa",
      encryptedNameNonce: "aaa",
      workspaceKeyId,
      subkeyId: 1,
      parentFolderId: null,
      workspaceId,
      keyDerivationTrace: {
        workspaceKeyId,
        subkeyId: 1,
        parentFolders: [],
      },
    };
  });

  const derivedFolderKeyData = await deriveFolderKey({
    folderId,
    workspaceId,
    workspaceKeyId,
    activeDevice,
  });
  expect(derivedFolderKeyData).toMatchInlineSnapshot(`
    {
      "folderKeyData": {
        "key": "6H8DHEVWRlmDnKBvBw5IhQF_Km69QOeKPMCjV2VWt0s",
        "subkeyId": 1,
      },
      "keyChain": [],
    }
  `);
});

it.only("should return single parentFolders", async () => {
  const activeDevice = await createDevice();
  const workspaceId = uuidv4();
  const workspaceKeyId = uuidv4();
  const folderId = uuidv4();
  const parentFolderId = uuidv4();
  const workspaceKeyString = await sodium.crypto_kdf_keygen();
  const workspaceKeyData = await createAndEncryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: activeDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey,
    workspaceKey: workspaceKeyString,
  });
  const workspaceKey = {
    __typename: "WorkspaceKey",
    id: workspaceKeyId,
    workspaceKeyBox: {
      __typename: "WorkspaceKeyBox",
      id: uuidv4(),
      ciphertext: workspaceKeyData.ciphertext,
      nonce: workspaceKeyData.nonce,
      deviceSigningPublicKey: "abc",
      creatorDevice: {
        __typename: "Device",
        id: uuidv4(),
        signingPublicKey: activeDevice.signingPublicKey,
        encryptionPublicKey: activeDevice.encryptionPublicKey,
      },
    },
  };
  // @ts-ignore getWorkspace is mocked
  getWorkspace.mockImplementation((props) => {
    return {
      __typename: "Workspace",
      id: workspaceId,
      currentWorkspaceKey: workspaceKey,
      workspaceKeys: [workspaceKey],
    };
  });

  // @ts-ignore getFolder is mocked
  getFolder.mockImplementation((props) => {
    console.log("props", props);
    if (props.folderId === folderId) {
      return {
        __typename: "Folder",
        id: folderId,
        encryptedName: "aaa",
        encryptedNameNonce: "aaa",
        workspaceKeyId,
        subkeyId: 1,
        parentFolderId: parentFolderId,
        workspaceId,
        keyDerivationTrace: {
          workspaceKeyId,
          subkeyId: 1,
          parentFolders: [
            {
              folderId: parentFolderId,
              subkeyId: 2,
              parentFolderId: null,
            },
          ],
        },
      };
    } else {
      return {
        __typename: "Folder",
        id: parentFolderId,
        encryptedName: "aaa",
        encryptedNameNonce: "aaa",
        workspaceKeyId,
        subkeyId: 1,
        parentFolderId: null,
        workspaceId,
        keyDerivationTrace: {
          workspaceKeyId,
          subkeyId: 2,
          parentFolders: [],
        },
      };
    }
  });

  const derivedFolderKeyData = await deriveFolderKey({
    folderId,
    workspaceId,
    workspaceKeyId,
    activeDevice,
  });
  expect(derivedFolderKeyData).toMatchInlineSnapshot(`
    {
      "folderKeyData": {
        "key": "R7Wgk-GO5acyqQXgyLHIJiQsBCks6siJW31fyuQVQZo",
        "subkeyId": 1,
      },
      "keyChain": [],
    }
  `);
});
