import { Snapshot } from "@naisho/core";
import {
  createIntroductionDocumentSnapshot,
  createSnapshotKey,
} from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";

const graphql = setupGraphql();
let userId1 = "";
const username = "user";
const password = "password";
let sessionKey1 = "";
let device: any = null;
let webDevice: any = null;
let encryptionPrivateKey = "";
let signingPrivateKey = "";
let workspaceKey = "";
const documentId = uuidv4();
let documentSnapshot: Snapshot;

const setup = async () => {
  const registerUserResult1 = await registerUser(graphql, username, password);
  registerUserResult1.mainDeviceSigningPublicKey;
  sessionKey1 = registerUserResult1.sessionKey;
  userId1 = registerUserResult1.userId;
  device = registerUserResult1.mainDevice;
  webDevice = registerUserResult1.webDevice;
  encryptionPrivateKey = registerUserResult1.encryptionPrivateKey;
  signingPrivateKey = registerUserResult1.signingPrivateKey;

  // hard-code the encryptionKey just so we have a document to run tests on
  const documentEncryptionKey = sodium.from_base64(
    "cksJKBDshtfjXJ0GdwKzHvkLxDp7WYYmdJkU1qPgM-0"
  );
  const folderKey = "cksJKBDshtfjXJ0GdwKzHvkLxDp7WYYmdJkU1qPgM-0";
  const snapshotKeyData = await createSnapshotKey({
    folderKey,
  });
  documentSnapshot = await createIntroductionDocumentSnapshot({
    documentId,
    documentEncryptionKey,
    subkeyId: snapshotKeyData.subkeyId,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user can create initial workspace structure", async () => {
  // generate a challenge code
  const workspaceId = uuidv4();
  const workspaceName = "New Workspace";
  const folderId = uuidv4();
  const result = await createInitialWorkspaceStructure({
    graphql,
    workspace: {
      id: workspaceId,
      name: workspaceName,
    },
    creatorDevice: {
      encryptionPrivateKey,
      signingPrivateKey,
      ...device,
    },
    webDevice,
    folder: {
      id: folderId,
      idSignature: `TODO+${folderId}`,
      name: "Getting started",
    },
    document: {
      id: uuidv4(),
      name: "Introduction",
    },
    authorizationHeader: sessionKey1,
  });

  const workspace = result.createInitialWorkspaceStructure.workspace;
  // const document = result.createInitialWorkspaceStructure.document;
  const folder = result.createInitialWorkspaceStructure.folder;
  expect(workspace.name).toBe(workspaceName);
  expect(workspace.id).toBe(workspaceId);
  expect(workspace.members.length).toBe(1);
  // expect(document.workspaceId).toBe(workspaceId);
  // expect(document.parentFolderId).toBe(folder.id);
  expect(folder.workspaceId).toBe(workspaceId);
  expect(folder.parentFolderId).toBe(null);
  workspace.members.forEach((member: { userId: string; role: Role }) => {
    expect(member.role).toBe(Role.ADMIN);
  });
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await createInitialWorkspaceStructure({
        graphql,
        workspace: {
          id: uuidv4(),
          name: "New Workspace",
        },
        creatorDevice: {
          encryptionPrivateKey,
          signingPrivateKey,
          ...device,
        },
        webDevice,
        folder: {
          id: uuidv4(),
          idSignature: `TODO+${uuidv4()}`,
          name: "Getting started",
        },
        document: {
          id: uuidv4(),
          name: "Introduction",
        },
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Test login", () => {
  const workspaceId = uuidv4();
  const workspaceName = "New Workspace";
  const folderId = uuidv4();
  const folderIdSignature = `TODO+${folderId}`;
  const folderName = "Getting started";

  const documentName = "Introduction";

  const authorizationHeaders = {
    authorization: sessionKey1,
  };
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

  test("Invalid workspaceName", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              workspace: {
                id: workspaceId,
                name: null,
              },
              folder: {
                id: folderId,
                idSignature: folderIdSignature,
                encryptedName: folderName,
                encryptedNameNonce: "",
              },
              document: {
                id: documentId,
                encryptedName: documentName,
                encryptedNameNonce: "",
                snapshot: documentSnapshot,
              },
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
              workspace: {
                id: null,
                name: workspaceName,
              },
              folder: {
                id: folderId,
                idSignature: folderIdSignature,
                encryptedName: folderName,
                encryptedNameNonce: "",
              },
              document: {
                id: documentId,
                encryptedName: documentName,
                encryptedNameNonce: "",
                snapshot: documentSnapshot,
              },
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });

  test("Invalid folderId", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              workspace: {
                id: workspaceId,
                name: workspaceName,
              },
              folder: {
                id: null,
                idSignature: folderIdSignature,
                encryptedName: folderName,
                encryptedNameNonce: "",
              },
              document: {
                id: documentId,
                encryptedName: documentName,
                encryptedNameNonce: "",
                snapshot: documentSnapshot,
              },
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });

  test("Invalid folderIdSignature", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              workspace: {
                id: workspaceId,
                name: workspaceName,
              },
              folder: {
                id: folderId,
                idSignature: null,
                encryptedName: folderName,
                encryptedNameNonce: "",
              },
              document: {
                id: documentId,
                encryptedName: documentName,
                encryptedNameNonce: "",
                snapshot: documentSnapshot,
              },
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });

  test("Invalid folderName", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              workspace: {
                id: workspaceId,
                name: workspaceName,
              },
              folder: {
                id: folderId,
                idSignature: folderIdSignature,
                encryptedName: null,
                encryptedNameNonce: "",
              },
              document: {
                id: documentId,
                encryptedName: documentName,
                encryptedNameNonce: "",
                snapshot: documentSnapshot,
              },
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });

  test("Invalid documentId", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              workspace: {
                id: workspaceId,
                name: workspaceName,
              },
              folder: {
                id: folderId,
                idSignature: folderIdSignature,
                encryptedName: folderName,
                encryptedNameNonce: "",
              },
              document: {
                id: null,
                encryptedName: documentName,
                encryptedNameNonce: "",
                snapshot: documentSnapshot,
              },
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid documentName", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              workspace: {
                id: workspaceId,
                name: workspaceName,
              },
              folder: {
                id: folderId,
                idSignature: folderIdSignature,
                encryptedName: folderName,
                encryptedNameNonce: "",
              },
              document: {
                id: documentId,
                encryptedName: null,
                encryptedNameNonce: "",
                snapshot: documentSnapshot,
              },
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });

  test("Invalid documentSnapshot", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              workspace: {
                id: workspaceId,
                name: workspaceName,
              },
              folder: {
                id: folderId,
                idSignature: folderIdSignature,
                encryptedName: folderName,
                encryptedNameNonce: "",
              },
              document: {
                id: documentId,
                encryptedName: documentName,
                encryptedNameNonce: "",
                snapshot: null,
              },
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

  test("deviceSigningPublicKey must belong to the user", async () => {
    // generate a challenge code
    await expect(
      (async () =>
        await createInitialWorkspaceStructure({
          graphql,
          workspace: {
            id: uuidv4(),
            name: "New Workspace",
          },
          creatorDevice: {
            encryptionPrivateKey,
            signingPrivateKey,
            ...device,
            signingPublicKey: "invalid",
          },
          webDevice,
          folder: {
            id: uuidv4(),
            idSignature: `TODO+${uuidv4()}`,
            name: "Getting started",
          },
          document: {
            id: uuidv4(),
            name: "Introduction",
          },
          authorizationHeader: sessionKey1,
        }))()
    ).rejects.toThrowError(/Internal server error/);
  });
});
