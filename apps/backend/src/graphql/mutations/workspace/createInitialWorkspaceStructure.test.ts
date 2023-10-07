import {
  createDevice,
  decryptFolderName,
  decryptWorkspaceKey,
  deriveKeysFromKeyDerivationTrace,
  folderDerivedKeyContext,
  generateId,
} from "@serenity-tools/common";
import { decryptDocumentTitleBasedOnSnapshotKey } from "@serenity-tools/common/src/decryptDocumentTitleBasedOnSnapshotKey/decryptDocumentTitleBasedOnSnapshotKey";
import { gql } from "graphql-request";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { getSnapshot } from "../../../../test/helpers/snapshot/getSnapshot";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";

const graphql = setupGraphql();
let userData1: any = undefined;

beforeAll(async () => {
  await deleteAllRecords();
  userData1 = await registerUser(
    graphql,
    `${generateId()}@example.com`,
    "password"
  );
});

test("create initial workspace structure", async () => {
  const authorizationHeader = userData1.sessionKey;
  const workspaceName = "My Worskpace";
  const result = await createInitialWorkspaceStructure({
    graphql,
    workspaceName,
    creatorDevice: {
      ...userData1.mainDevice,
      encryptionPrivateKey: userData1.encryptionPrivateKey,
      signingPrivateKey: userData1.signingPrivateKey,
    },
    mainDevice: userData1.mainDevice,
    devices: [userData1.mainDevice, userData1.webDevice],
    authorizationHeader,
  });

  const workspace = result.createInitialWorkspaceStructure.workspace;
  const document = result.createInitialWorkspaceStructure.document;
  const folder = result.createInitialWorkspaceStructure.folder;
  workspace.currentWorkspaceKey.workspaceKeyBox.creatorDevice =
    userData1.mainDevice;
  expect(workspace.id).not.toBeNull();
  expect(workspace.id).not.toBeUndefined();
  expect(workspace.name).toBe(workspaceName);
  expect(workspace.currentWorkspaceKey.id).not.toBeNull();
  expect(folder.id).not.toBeNull();
  expect(folder.id).not.toBeUndefined();
  expect(folder.parentFolderId).toBe(null);
  expect(folder.rootFolderId).toBe(null);
  expect(typeof folder.nameCiphertext).toBe("string");
  expect(typeof folder.nameNonce).toBe("string");
  expect(typeof folder.keyDerivationTrace).toBe("object");
  expect(typeof folder.keyDerivationTrace.workspaceKeyId).toBe("string");
  expect(typeof folder.keyDerivationTrace.trace[0].subkeyId).toBe("number");
  expect(folder.keyDerivationTrace.trace[0].parentId).toBe(
    folder.parentFolderId
  );
  expect(folder.keyDerivationTrace.trace[0].entryId).toBe(folder.id);
  expect(folder.keyDerivationTrace.trace[0].context).toBe(
    folderDerivedKeyContext
  );
  expect(document.id).not.toBeNull();
  expect(document.id).not.toBeUndefined();
  expect(typeof document.nameCiphertext).toBe("string");
  expect(typeof document.nameNonce).toBe("string");
  expect(typeof document.subkeyId).toBe("number");
  // attempt to decrypt the folder and document names
  const workspaceKeyBox = workspace.currentWorkspaceKey.workspaceKeyBox;
  const workspaceKey = decryptWorkspaceKey({
    ciphertext: workspaceKeyBox.ciphertext,
    nonce: workspaceKeyBox.nonce,
    creatorDeviceEncryptionPublicKey: userData1.mainDevice.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
  });
  expect(typeof workspaceKey).toBe("string");
  const decryptedFolderName = decryptFolderName({
    parentKey: workspaceKey,
    subkeyId: folder.keyDerivationTrace.trace[0].subkeyId,
    ciphertext: folder.nameCiphertext,
    publicNonce: folder.nameNonce,
  });
  // TODO: derive document key from trace
  expect(decryptedFolderName).toBe("Getting Started");

  const { snapshot } = await getSnapshot({
    graphql,
    documentId: document.id,
    authorizationHeader,
  });

  const snapshotKeyTrace = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: snapshot.keyDerivationTrace,
    activeDevice: {
      ...userData1.mainDevice,
      encryptionPrivateKey: userData1.encryptionPrivateKey,
      signingPrivateKey: userData1.signingPrivateKey,
    },
    workspaceKeyBox: workspace.currentWorkspaceKey.workspaceKeyBox,
  });
  const snapshotKey =
    snapshotKeyTrace.trace[snapshotKeyTrace.trace.length - 1].key;

  const decryptedDocumentName = decryptDocumentTitleBasedOnSnapshotKey({
    snapshotKey,
    subkeyId: document.subkeyId,
    ciphertext: document.nameCiphertext,
    nonce: document.nameNonce,
  });
  expect(decryptedDocumentName).toBe("Introduction");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await createInitialWorkspaceStructure({
        graphql,
        workspaceName: "Getting Started",
        creatorDevice: {
          ...userData1.mainDevice,
          encryptionPrivateKey: userData1.encryptionPrivateKey,
          signingPrivateKey: userData1.signingPrivateKey,
        },
        mainDevice: userData1.mainDevice,
        devices: [userData1.mainDevice, userData1.webDevice],
        authorizationHeader: "invalid-session-key",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

test("creator device must belong to user", async () => {
  const badDevice = createDevice("user");
  await expect(
    (async () =>
      await createInitialWorkspaceStructure({
        graphql,
        workspaceName: "Getting Started",
        creatorDevice: {
          ...userData1.mainDevice,
          encryptionPrivateKey: badDevice.encryptionPrivateKey,
          signingPrivateKey: badDevice.signingPrivateKey,
        },
        mainDevice: userData1.mainDevice,
        devices: [badDevice, userData1.webDevice],
        authorizationHeader: "invalid-session-key",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

const query = gql`
  mutation createInitialWorkspaceStructure(
    $input: CreateInitialWorkspaceStructureInput!
  ) {
    createInitialWorkspaceStructure(input: $input) {
      workspace {
        id
        name
      }
      folder {
        id
        parentFolderId
        rootFolderId
        workspaceId
      }
    }
  }
`;

test("Invalid workspace name", async () => {
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        {
          input: {
            workspace: {
              id: generateId(),
              name: null,
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: generateId(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              subkeyId: 123,
            },
            creatorDeviceSigningPublicKey: "",
          },
        },
        { authorization: userData1.sessionKey }
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Invalid workspace id", async () => {
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        {
          input: {
            workspace: {
              id: null,
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: generateId(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              subkeyId: 123,
            },
            creatorDeviceSigningPublicKey: "",
          },
        },
        { authorization: userData1.sessionKey }
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Invalid folder id", async () => {
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        {
          input: {
            workspace: {
              id: generateId(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: null,
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: generateId(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              subkeyId: 123,
            },
            creatorDeviceSigningPublicKey: "",
          },
        },
        { authorization: userData1.sessionKey }
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Invalid folder name", async () => {
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        {
          input: {
            workspace: {
              id: generateId(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: null,
              nameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: generateId(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              subkeyId: 123,
            },
            creatorDeviceSigningPublicKey: "",
          },
        },
        { authorization: userData1.sessionKey }
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Invalid folder nonce", async () => {
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        {
          input: {
            workspace: {
              id: generateId(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: null,
              keyDerivationTrace: {
                workspaceKeyId: generateId(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              subkeyId: 123,
            },
            creatorDeviceSigningPublicKey: "",
          },
        },
        { authorization: userData1.sessionKey }
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Invalid folder trace", async () => {
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        {
          input: {
            workspace: {
              id: generateId(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              keyDerivationTrace: null,
            },
            document: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              subkeyId: 123,
            },
            creatorDeviceSigningPublicKey: "",
          },
        },
        { authorization: userData1.sessionKey }
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Invalid document id", async () => {
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        {
          input: {
            workspace: {
              id: generateId(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: generateId(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: null,
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              subkeyId: 123,
            },
            creatorDeviceSigningPublicKey: "",
          },
        },
        { authorization: userData1.sessionKey }
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Invalid document name", async () => {
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        {
          input: {
            workspace: {
              id: generateId(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: generateId(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: null,
              nameNonce: "",
              subkeyId: 123,
            },
            creatorDeviceSigningPublicKey: "",
          },
        },
        { authorization: userData1.sessionKey }
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Invalid document nonce", async () => {
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        {
          input: {
            workspace: {
              id: generateId(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: generateId(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: null,
              subkeyId: 123,
            },
            creatorDeviceSigningPublicKey: "",
          },
        },
        { authorization: userData1.sessionKey }
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Invalid subkeyId", async () => {
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        {
          input: {
            workspace: {
              id: generateId(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: generateId(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              subkeyId: null,
            },
            creatorDeviceSigningPublicKey: "",
          },
        },
        { authorization: userData1.sessionKey }
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Invalid creator device", async () => {
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        {
          input: {
            workspace: {
              id: generateId(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: generateId(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              subkeyId: 123,
            },
            creatorDeviceSigningPublicKey: null,
          },
        },
        { authorization: userData1.sessionKey }
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("creator device must belong to user", async () => {
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        {
          input: {
            workspace: {
              id: generateId(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: generateId(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: generateId(),
              idSignature: `TODO+${generateId()}`,
              nameCiphertext: "",
              nameNonce: "",
              subkeyId: 123,
            },
            creatorDeviceSigningPublicKey: "invalid-device-public-key",
          },
        },
        { authorization: userData1.sessionKey }
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});
