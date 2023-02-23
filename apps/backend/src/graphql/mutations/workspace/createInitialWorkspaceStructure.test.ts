import {
  createDevice,
  decryptDocumentTitle,
  decryptFolderName,
  decryptWorkspaceKey,
  folderDerivedKeyContext,
  recreateDocumentKey,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";

const graphql = setupGraphql();
let userData1: any = undefined;

const setup = async () => {
  userData1 = await registerUser(
    graphql,
    `${uuidv4()}@example.com`,
    "password"
  );
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
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
    devices: [userData1.mainDevice, userData1.webDevice],
    authorizationHeader,
  });

  const workspace = result.createInitialWorkspaceStructure.workspace;
  const document = result.createInitialWorkspaceStructure.document;
  const folder = result.createInitialWorkspaceStructure.folder;
  expect(workspace.id).not.toBeNull();
  expect(workspace.id).not.toBeUndefined();
  expect(workspace.name).toBe(workspaceName);
  expect(workspace.members.length).toBe(1);
  workspace.members.forEach((member: { userId: string; role: Role }) => {
    expect(member.role).toBe(Role.ADMIN);
  });
  expect(workspace.currentWorkspaceKey.id).not.toBeNull();
  expect(folder.id).not.toBeNull();
  expect(folder.id).not.toBeUndefined();
  expect(folder.parentFolderId).toBe(null);
  expect(folder.rootFolderId).toBe(null);
  expect(typeof folder.encryptedName).toBe("string");
  expect(typeof folder.encryptedNameNonce).toBe("string");
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
  expect(typeof document.encryptedName).toBe("string");
  expect(typeof document.encryptedNameNonce).toBe("string");
  expect(typeof document.nameKeyDerivationTrace).toBe("object");
  expect(typeof document.nameKeyDerivationTrace.workspaceKeyId).toBe("string");
  expect(typeof document.nameKeyDerivationTrace.subkeyId).toBe("number");
  expect(typeof document.nameKeyDerivationTrace.parentFolders).toBe("object");
  // expect(typeof document.snapshot.keyDerivationTrace).toBe(KeyDerivationTrace);

  // attempt to decrypt the folder and document names
  const workspaceKeyBox = workspace.currentWorkspaceKey.workspaceKeyBox;
  const workspaceKey = decryptWorkspaceKey({
    ciphertext: workspaceKeyBox.ciphertext,
    nonce: workspaceKeyBox.nonce,
    creatorDeviceEncryptionPublicKey: userData1.mainDevice.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
  });
  expect(typeof workspaceKey).toBe("string");
  const folderKey = kdfDeriveFromKey({
    key: workspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: folder.keyDerivationTrace.trace[0].subkeyId,
  });
  const decryptedFolderName = decryptFolderName({
    parentKey: workspaceKey,
    subkeyId: folder.keyDerivationTrace.trace[0].subkeyId,
    ciphertext: folder.encryptedName,
    publicNonce: folder.encryptedNameNonce,
  });
  // TODO: derive document key from trace
  expect(decryptedFolderName).toBe("Getting Started");
  const documentKey = recreateDocumentKey({
    folderKey: folderKey.key,
    subkeyId: document.nameKeyDerivationTrace.subkeyId,
  });
  const decryptedDocumentName = decryptDocumentTitle({
    key: documentKey.key,
    ciphertext: document.encryptedName,
    publicNonce: document.encryptedNameNonce,
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
        devices: [userData1.mainDevice, userData1.webDevice],
        authorizationHeader: "invalid-session-key",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

test("creator device must belong to user", async () => {
  const badDevice = createDevice();
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
        members {
          userId
          role
        }
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
              id: uuidv4(),
              name: null,
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              nameKeyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
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
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              nameKeyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
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
              id: uuidv4(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: null,
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              nameKeyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
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
              id: uuidv4(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: null,
              encryptedNameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              nameKeyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
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
              id: uuidv4(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: null,
              keyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              nameKeyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
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
              id: uuidv4(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              keyDerivationTrace: null,
            },
            document: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              nameKeyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
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
              id: uuidv4(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: null,
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              nameKeyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
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
              id: uuidv4(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: null,
              encryptedNameNonce: "",
              nameKeyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
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
              id: uuidv4(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: null,
              nameKeyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            creatorDeviceSigningPublicKey: "",
          },
        },
        { authorization: userData1.sessionKey }
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Invalid document trace", async () => {
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        {
          input: {
            workspace: {
              id: uuidv4(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              nameKeyDerivationTrace: null,
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
              id: uuidv4(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              nameKeyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
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
              id: uuidv4(),
              name: "Getting Started",
              deviceWorkspaceKeyBoxes: [],
            },
            folder: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            document: {
              id: uuidv4(),
              idSignature: `TODO+${uuidv4()}`,
              encryptedName: "",
              encryptedNameNonce: "",
              nameKeyDerivationTrace: {
                workspaceKeyId: uuidv4(),
                subkeyId: 0,
                parentFolders: [],
              },
            },
            creatorDeviceSigningPublicKey: "invalid-device-public-key",
          },
        },
        { authorization: userData1.sessionKey }
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});
