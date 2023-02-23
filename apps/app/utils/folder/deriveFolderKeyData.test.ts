jest.mock("../../generated/graphql", () => ({ __esModule: true }));
jest.mock("./getFolder", () => ({
  __esModule: true,
  getFolder: jest.fn(),
}));
jest.mock("../workspace/getWorkspace", () => ({
  __esModule: true,
  getWorkspace: jest.fn(),
}));

import {
  createAndEncryptWorkspaceKeyForDevice,
  createDevice,
  encryptFolderName,
} from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { v4 as uuidv4 } from "uuid";
import { getWorkspace } from "../workspace/getWorkspace";
import { deriveFolderKey } from "./deriveFolderKeyData";
import { getFolder } from "./getFolder";

beforeAll(async () => {
  await sodium.ready;
});

it("should return empty parentFolders", async () => {
  const activeDevice = createDevice();
  const workspaceId = uuidv4();
  const workspaceKeyId = uuidv4();
  const folderId = uuidv4();
  const workspaceKeyData = createAndEncryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: activeDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey,
  });
  const workspaceKeyString = workspaceKeyData.workspaceKey;
  const folderNameData = encryptFolderName({
    name: "folderName",
    parentKey: workspaceKeyString,
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
      encryptedName: folderNameData.ciphertext,
      encryptedNameNonce: folderNameData.publicNonce,
      workspaceKeyId,
      subkeyId: folderNameData.folderSubkeyId,
      parentFolderId: null,
      workspaceId,
      keyDerivationTrace: {
        workspaceKeyId,
        subkeyId: folderNameData.folderSubkeyId,
        parentFolders: [],
      },
    };
  });

  const derivedFolderKeyData = await deriveFolderKey({
    folderId,
    workspaceId,
    activeDevice,
    keyDerivationTrace: {
      workspaceKeyId,
      subkeyId: folderNameData.folderSubkeyId,
      parentFolders: [],
    },
  });
  expect(derivedFolderKeyData).toMatchInlineSnapshot(`
    [
      {
        "folderId": "workspaceKeyId-${workspaceKeyId}",
        "key": "${workspaceKeyString}",
        "subkeyId": undefined,
      },
    ]
  `);
});

it("should return single parentFolders", async () => {
  const activeDevice = createDevice();
  const workspaceId = uuidv4();
  const workspaceKeyId = uuidv4();
  const folderId = uuidv4();
  const parentFolderId = uuidv4();
  const workspaceKeyData = createAndEncryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: activeDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey,
  });
  const workspaceKeyString = workspaceKeyData.workspaceKey;
  const parentFolderNameData = encryptFolderName({
    name: "parentFolderName",
    parentKey: workspaceKeyString,
  });
  const folderNameData = encryptFolderName({
    name: "folderName",
    parentKey: parentFolderNameData.folderSubkey,
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
    if (props.folderId === folderId) {
      return {
        __typename: "Folder",
        id: folderId,
        encryptedName: folderNameData.ciphertext,
        encryptedNameNonce: folderNameData.publicNonce,
        workspaceKeyId,
        subkeyId: folderNameData.folderSubkeyId,
        parentFolderId: parentFolderId,
        workspaceId,
        keyDerivationTrace: {
          workspaceKeyId,
          subkeyId: folderNameData.folderSubkeyId,
          parentFolders: [
            {
              folderId: parentFolderId,
              subkeyId: parentFolderNameData.folderSubkeyId,
              parentFolderId: null,
            },
          ],
        },
      };
    } else {
      return {
        __typename: "Folder",
        id: parentFolderId,
        encryptedName: parentFolderNameData.ciphertext,
        encryptedNameNonce: parentFolderNameData.publicNonce,
        workspaceKeyId,
        subkeyId: parentFolderNameData.folderSubkeyId,
        parentFolderId: null,
        workspaceId,
        keyDerivationTrace: {
          workspaceKeyId,
          subkeyId: parentFolderNameData.folderSubkeyId,
          parentFolders: [],
        },
      };
    }
  });

  const derivedFolderKeyData = await deriveFolderKey({
    folderId,
    workspaceId,
    activeDevice,
    keyDerivationTrace: {
      workspaceKeyId,
      subkeyId: folderNameData.folderSubkeyId,
      parentFolders: [
        {
          folderId: parentFolderId,
          subkeyId: parentFolderNameData.folderSubkeyId,
          parentFolderId: null,
        },
      ],
    },
  });
  expect(derivedFolderKeyData).toMatchInlineSnapshot(`
    [
      {
        "folderId": "workspaceKeyId-${workspaceKeyId}",
        "key": "${workspaceKeyString}",
        "subkeyId": undefined,
      },
      {
        "folderId": "${parentFolderId}",
        "key": "${parentFolderNameData.folderSubkey}",
        "subkeyId": ${parentFolderNameData.folderSubkeyId},
      },
    ]
  `);
});

it("should return deep parentFolders", async () => {
  const activeDevice = createDevice();
  const workspaceId = uuidv4();
  const workspaceKeyId = uuidv4();
  const folderId = uuidv4();
  const parentFolderId = uuidv4();
  const childFolderId = uuidv4();
  const workspaceKeyData = createAndEncryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: activeDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey,
  });
  const workspaceKeyString = workspaceKeyData.workspaceKey;
  const parentFolderNameData = encryptFolderName({
    name: "parentFolderName",
    parentKey: workspaceKeyString,
  });
  const folderNameData = encryptFolderName({
    name: "folderName",
    parentKey: parentFolderNameData.folderSubkey,
  });
  const childFolderNameData = encryptFolderName({
    name: "childFolderName",
    parentKey: folderNameData.folderSubkey,
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
    if (props.folderId === childFolderId) {
      return {
        __typename: "Folder",
        id: childFolderId,
        encryptedName: childFolderNameData.ciphertext,
        encryptedNameNonce: childFolderNameData.publicNonce,
        workspaceKeyId,
        subkeyId: childFolderNameData.folderSubkeyId,
        parentFolderId: folderId,
        workspaceId,
        keyDerivationTrace: {
          workspaceKeyId,
          subkeyId: childFolderNameData.folderSubkeyId,
          parentFolders: [
            {
              folderId: folderId,
              subkeyId: folderNameData.folderSubkeyId,
              parentFolderId: parentFolderId,
            },
            {
              folderId: parentFolderId,
              subkeyId: parentFolderNameData.folderSubkeyId,
              parentFolderId: null,
            },
          ],
        },
      };
    } else if (props.folderId === folderId) {
      return {
        __typename: "Folder",
        id: folderId,
        encryptedName: folderNameData.ciphertext,
        encryptedNameNonce: folderNameData.publicNonce,
        workspaceKeyId,
        subkeyId: folderNameData.folderSubkeyId,
        parentFolderId: parentFolderId,
        workspaceId,
        keyDerivationTrace: {
          workspaceKeyId,
          subkeyId: folderNameData.folderSubkeyId,
          parentFolders: [
            {
              folderId: parentFolderId,
              subkeyId: parentFolderNameData.folderSubkeyId,
              parentFolderId: null,
            },
          ],
        },
      };
    } else {
      return {
        __typename: "Folder",
        id: parentFolderId,
        encryptedName: parentFolderNameData.ciphertext,
        encryptedNameNonce: parentFolderNameData.publicNonce,
        workspaceKeyId,
        subkeyId: parentFolderNameData.folderSubkeyId,
        parentFolderId: null,
        workspaceId,
        keyDerivationTrace: {
          workspaceKeyId,
          subkeyId: parentFolderNameData.folderSubkeyId,
          parentFolders: [],
        },
      };
    }
  });

  const derivedFolderKeyData = await deriveFolderKey({
    folderId: childFolderId,
    workspaceId,
    activeDevice,
    keyDerivationTrace: {
      workspaceKeyId,
      subkeyId: childFolderNameData.folderSubkeyId,
      parentFolders: [
        {
          folderId: folderId,
          subkeyId: folderNameData.folderSubkeyId,
          parentFolderId: null,
        },
        {
          folderId: parentFolderId,
          subkeyId: parentFolderNameData.folderSubkeyId,
          parentFolderId: null,
        },
      ],
    },
  });
  expect(derivedFolderKeyData).toMatchInlineSnapshot(`
    [
      {
        "folderId": "workspaceKeyId-${workspaceKeyId}",
        "key": "${workspaceKeyString}",
        "subkeyId": undefined,
      },
      {
        "folderId": "${parentFolderId}",
        "key": "${parentFolderNameData.folderSubkey}",
        "subkeyId": ${parentFolderNameData.folderSubkeyId},
      },
      {
        "folderId": "${folderId}",
        "key": "${folderNameData.folderSubkey}",
        "subkeyId": ${folderNameData.folderSubkeyId},
      },
    ]
  `);
});
