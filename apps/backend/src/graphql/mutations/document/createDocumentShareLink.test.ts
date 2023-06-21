import {
  createSnapshotKey,
  deriveKeysFromKeyDerivationTrace,
  generateId,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocumentShareLink } from "../../../../test/helpers/document/createDocumentShareLink";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { getWorkspace } from "../../../../test/helpers/workspace/getWorkspace";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password";
let userData1: any = null;
let user1Workspace: any = null;

const setup = async () => {
  await sodium.ready;
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  const getWorkspaceResult = await getWorkspace({
    graphql,
    workspaceId: userData1.workspace.id,
    authorizationHeader: userData1.sessionKey,
    deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
  });
  user1Workspace = getWorkspaceResult.workspace;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("create admin share link fails", async () => {
  const sharingRole = Role.ADMIN;
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    userData1.webDevice;
  const folderKeyTrace = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: userData1.folder.keyDerivationTrace,
    activeDevice: userData1.webDevice,
    workspaceKeyBox: user1Workspace.currentWorkspaceKey.workspaceKeyBox,
  });
  const snapshotKeyData = createSnapshotKey({
    folderKey: folderKeyTrace.trace[folderKeyTrace.trace.length - 1].key,
  });
  await expect(
    (async () =>
      await createDocumentShareLink({
        graphql,
        documentId: userData1.document.id,
        sharingRole,
        creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
        creatorDevice,
        snapshotKey: snapshotKeyData.key,
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("create editor share link", async () => {
  const sharingRole = Role.EDITOR;
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    userData1.webDevice;
  const folderKeyTrace = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: userData1.folder.keyDerivationTrace,
    activeDevice: userData1.webDevice,
    workspaceKeyBox: user1Workspace.currentWorkspaceKey.workspaceKeyBox,
  });
  const snapshotKeyData = createSnapshotKey({
    folderKey: folderKeyTrace.trace[folderKeyTrace.trace.length - 1].key,
  });
  const documentShareLinkResponse = await createDocumentShareLink({
    graphql,
    documentId: userData1.document.id,
    sharingRole,
    creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
    creatorDevice,
    snapshotKey: snapshotKeyData.key,
    authorizationHeader: userData1.sessionKey,
  });
  const documentShareLink = documentShareLinkResponse.createDocumentShareLink;
  expect(typeof documentShareLink.token).toBe("string");
  expect(documentShareLink.role).toBe(sharingRole);
});

test("create commenter share link", async () => {
  const sharingRole = Role.COMMENTER;
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    userData1.webDevice;
  const folderKeyTrace = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: userData1.folder.keyDerivationTrace,
    activeDevice: userData1.webDevice,
    workspaceKeyBox: user1Workspace.currentWorkspaceKey.workspaceKeyBox,
  });
  const snapshotKeyData = createSnapshotKey({
    folderKey: folderKeyTrace.trace[folderKeyTrace.trace.length - 1].key,
  });
  const documentShareLinkResponse = await createDocumentShareLink({
    graphql,
    documentId: userData1.document.id,
    sharingRole,
    creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
    creatorDevice,
    snapshotKey: snapshotKeyData.key,
    authorizationHeader: userData1.sessionKey,
  });
  const documentShareLink = documentShareLinkResponse.createDocumentShareLink;
  expect(typeof documentShareLink.token).toBe("string");
  expect(documentShareLink.role).toBe(sharingRole);
});

test("create viewer share link", async () => {
  const sharingRole = Role.VIEWER;
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    userData1.webDevice;
  const folderKeyTrace = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: userData1.folder.keyDerivationTrace,
    activeDevice: userData1.webDevice,
    workspaceKeyBox: user1Workspace.currentWorkspaceKey.workspaceKeyBox,
  });
  const snapshotKeyData = createSnapshotKey({
    folderKey: folderKeyTrace.trace[folderKeyTrace.trace.length - 1].key,
  });
  const documentShareLinkResponse = await createDocumentShareLink({
    graphql,
    documentId: userData1.document.id,
    sharingRole,
    creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
    creatorDevice,
    snapshotKey: snapshotKeyData.key,
    authorizationHeader: userData1.sessionKey,
  });
  const documentShareLink = documentShareLinkResponse.createDocumentShareLink;
  expect(typeof documentShareLink.token).toBe("string");
  expect(documentShareLink.role).toBe(sharingRole);
});

test("Invalid ownership", async () => {
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    userData1.webDevice;
  const folderKeyTrace = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: userData1.folder.keyDerivationTrace,
    activeDevice: userData1.webDevice,
    workspaceKeyBox: user1Workspace.currentWorkspaceKey.workspaceKeyBox,
  });
  const snapshotKeyData = createSnapshotKey({
    folderKey: folderKeyTrace.trace[folderKeyTrace.trace.length - 1].key,
  });
  await expect(
    (async () =>
      await createDocumentShareLink({
        graphql,
        documentId: userData1.document.id,
        //@ts-ignore: invalid role type
        sharingRole: "bad-role",
        creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
        creatorDevice,
        snapshotKey: snapshotKeyData.key,
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Invalid ownership", async () => {
  const otherUser = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    otherUser.webDevice;
  const documentId = userData1.document.id;
  const authorizationHeader = otherUser.sessionKey;
  const folderKeyTrace = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: userData1.folder.keyDerivationTrace,
    activeDevice: userData1.webDevice,
    workspaceKeyBox: user1Workspace.currentWorkspaceKey.workspaceKeyBox,
  });
  const snapshotKeyData = createSnapshotKey({
    folderKey: folderKeyTrace.trace[folderKeyTrace.trace.length - 1].key,
  });
  await expect(
    (async () =>
      await createDocumentShareLink({
        graphql,
        documentId,
        sharingRole: Role.EDITOR,
        creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
        creatorDevice,
        snapshotKey: snapshotKeyData.key,
        authorizationHeader,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Unauthenticated", async () => {
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    userData1.webDevice;
  const snapshotKey = sodium.to_base64(sodium.crypto_kdf_keygen());
  await expect(
    (async () =>
      await createDocumentShareLink({
        graphql,
        documentId: userData1.document.id,
        sharingRole: Role.EDITOR,
        creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
        creatorDevice,
        snapshotKey,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const query = gql`
    mutation createDocumentShareLink($input: CreateDocumentShareLinkInput!) {
      createDocumentShareLink(input: $input) {
        token
      }
    }
  `;
  test("Invalid documentId", async () => {
    const userData1 = await createUserWithWorkspace({
      username: `${generateId()}@example.com`,
      password,
    });
    const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
      userData1.webDevice;
    const snapshotKey = sodium.to_base64(sodium.crypto_kdf_keygen());
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              graphql,
              documentId: null,
              sharingRole: Role.EDITOR,
              creatorDevice,
              deviceSecretBoxCiphertext: "",
              deviceSecretBoxNonce: "",
              snapshotKey,
            },
          },
          { authorization: userData1.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid sharing role", async () => {
    const userData1 = await createUserWithWorkspace({
      username: `${generateId()}@example.com`,
      password,
    });
    const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
      userData1.webDevice;
    const snapshotKey = sodium.to_base64(sodium.crypto_kdf_keygen());
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              graphql,
              documentId: userData1.document.id,
              sharingRole: null,
              creatorDevice,
              deviceSecretBoxCiphertext: "",
              deviceSecretBoxNonce: "",
              snapshotKey,
            },
          },
          { authorization: userData1.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid creator device", async () => {
    const userData1 = await createUserWithWorkspace({
      username: `${generateId()}@example.com`,
      password,
    });
    const otherUser = await createUserWithWorkspace({
      username: `${generateId()}@example.com`,
      password,
    });
    const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
      otherUser.webDevice;
    const snapshotKey = sodium.to_base64(sodium.crypto_kdf_keygen());
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              graphql,
              documentId: userData1.document.id,
              sharingRole: Role.VIEWER,
              creatorDevice,
              deviceSecretBoxCiphertext: "",
              deviceSecretBoxNonce: "",
              snapshotKey,
            },
          },
          { authorization: userData1.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    const userData1 = await createUserWithWorkspace({
      username: `${generateId()}@example.com`,
      password,
    });
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: null,
          },
          { authorization: userData1.sessionKey }
        ))()
    ).rejects.toThrowError();
  });
  test("No input", async () => {
    const userData1 = await createUserWithWorkspace({
      username: `${generateId()}@example.com`,
      password,
    });
    await expect(
      (async () =>
        await graphql.client.request(query, null, {
          authorization: userData1.sessionKey,
        }))()
    ).rejects.toThrowError();
  });
});
