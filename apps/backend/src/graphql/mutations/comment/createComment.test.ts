import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import { createComment } from "../../../../test/helpers/comment/createComment";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocumentShareLink } from "../../../../test/helpers/document/createDocumentShareLink";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
let sessionKey = "";
let documentId1 = "";
let snapshotId1 = "";
let snapshotKey1 = "";
const password = "password";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  documentId1 = userData1.document.id;
  snapshotId1 = userData1.snapshot.id;
  sessionKey = userData1.sessionKey;
  snapshotKey1 = userData1.snapshotKey.key;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("owner comments", async () => {
  const createCommentResult = await createComment({
    graphql,
    snapshotId: snapshotId1,
    snapshotKey: snapshotKey1,
    comment: "nice job",
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    authorizationHeader: userData1.sessionKey,
  });
  const comment = createCommentResult.createComment.comment;
  expect(typeof comment.id).toBe("string");
  expect(comment.documentId).toBe(documentId1);
  expect(comment.snapshotId).toBe(snapshotId1);
  expect(typeof comment.contentCiphertext).toBe("string");
  expect(typeof comment.contentNonce).toBe("string");
  expect(typeof comment.createdAt).toBe("string");
  expect(comment.creatorDevice.signingPublicKey).toBe(
    userData1.webDevice.signingPublicKey
  );
  expect(comment.creatorDevice.encryptionPublicKey).toBe(
    userData1.webDevice.encryptionPublicKey
  );
});

test("shared admin comments", async () => {
  const userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password: "password",
  });
  const snapshotKey = sodium.to_base64(sodium.crypto_kdf_keygen());
  const documentShareLinkResult = await createDocumentShareLink({
    graphql,
    documentId: userData1.document.id,
    sharingRole: Role.ADMIN,
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    snapshotKey,
    authorizationHeader: userData1.sessionKey,
  });
  const documentShareLinkToken =
    documentShareLinkResult.createDocumentShareLink.token;
  const createCommentResult = await createComment({
    graphql,
    snapshotId: snapshotId1,
    snapshotKey: snapshotKey1,
    comment: "nice job",
    creatorDevice: userData2.webDevice,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    documentShareLinkToken,
    authorizationHeader: userData2.sessionKey,
  });
  const comment = createCommentResult.createComment.comment;
  expect(typeof comment.id).toBe("string");
  expect(comment.documentId).toBe(documentId1);
  expect(typeof comment.contentCiphertext).toBe("string");
  expect(typeof comment.contentNonce).toBe("string");
  expect(typeof comment.createdAt).toBe("string");
  expect(comment.creatorDevice.signingPublicKey).toBe(
    userData2.webDevice.signingPublicKey
  );
  expect(comment.creatorDevice.encryptionPublicKey).toBe(
    userData2.webDevice.encryptionPublicKey
  );
});

test("shared editor comments", async () => {
  const userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password: "password",
  });
  const snapshotKey = sodium.to_base64(sodium.crypto_kdf_keygen());
  const documentShareLinkResult = await createDocumentShareLink({
    graphql,
    documentId: userData1.document.id,
    sharingRole: Role.EDITOR,
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    snapshotKey,
    authorizationHeader: userData1.sessionKey,
  });
  const documentShareLinkToken =
    documentShareLinkResult.createDocumentShareLink.token;
  const createCommentResult = await createComment({
    graphql,
    snapshotId: snapshotId1,
    snapshotKey: snapshotKey1,
    comment: "nice job",
    creatorDevice: userData2.webDevice,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    documentShareLinkToken,
    authorizationHeader: userData2.sessionKey,
  });
  const comment = createCommentResult.createComment.comment;
  expect(typeof comment.id).toBe("string");
  expect(comment.documentId).toBe(documentId1);
  expect(typeof comment.contentCiphertext).toBe("string");
  expect(typeof comment.contentNonce).toBe("string");
  expect(typeof comment.createdAt).toBe("string");
  expect(comment.creatorDevice.signingPublicKey).toBe(
    userData2.webDevice.signingPublicKey
  );
  expect(comment.creatorDevice.encryptionPublicKey).toBe(
    userData2.webDevice.encryptionPublicKey
  );
});

test("shared commentor comments", async () => {
  const userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password: "password",
  });
  const snapshotKey = sodium.to_base64(sodium.crypto_kdf_keygen());
  const documentShareLinkResult = await createDocumentShareLink({
    graphql,
    documentId: userData1.document.id,
    sharingRole: Role.COMMENTER,
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    snapshotKey,
    authorizationHeader: userData1.sessionKey,
  });
  const documentShareLinkToken =
    documentShareLinkResult.createDocumentShareLink.token;
  const createCommentResult = await createComment({
    graphql,
    snapshotId: snapshotId1,
    snapshotKey: snapshotKey1,
    comment: "nice job",
    creatorDevice: userData2.webDevice,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    documentShareLinkToken,
    authorizationHeader: userData2.sessionKey,
  });
  const comment = createCommentResult.createComment.comment;
  expect(typeof comment.id).toBe("string");
  expect(comment.documentId).toBe(documentId1);
  expect(typeof comment.contentCiphertext).toBe("string");
  expect(typeof comment.contentNonce).toBe("string");
  expect(typeof comment.createdAt).toBe("string");
  expect(comment.creatorDevice.signingPublicKey).toBe(
    userData2.webDevice.signingPublicKey
  );
  expect(comment.creatorDevice.encryptionPublicKey).toBe(
    userData2.webDevice.encryptionPublicKey
  );
});

test("shared viewer cannot comment", async () => {
  const userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password: "password",
  });
  const snapshotKey = sodium.to_base64(sodium.crypto_kdf_keygen());
  const documentShareLinkResult = await createDocumentShareLink({
    graphql,
    documentId: userData1.document.id,
    sharingRole: Role.VIEWER,
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    snapshotKey,
    authorizationHeader: userData1.sessionKey,
  });
  const documentShareLinkToken =
    documentShareLinkResult.createDocumentShareLink.token;
  await expect(
    (async () =>
      await createComment({
        graphql,
        snapshotId: snapshotId1,
        snapshotKey: snapshotKey1,
        comment: "nice job",
        creatorDevice: userData2.device,
        creatorDeviceEncryptionPrivateKey: userData2.deviceEncryptionPrivateKey,
        creatorDeviceSigningPrivateKey: userData2.deviceSigningPrivateKey,
        documentShareLinkToken,
        authorizationHeader: userData2.sessionKey,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("admin comments", async () => {
  await prisma.usersToWorkspaces.updateMany({
    where: {
      userId: userData1.user.id,
      workspaceId: userData1.workspace.id,
    },
    data: {
      role: Role.ADMIN,
    },
  });
  const createCommentResult = await createComment({
    graphql,
    snapshotId: snapshotId1,
    snapshotKey: snapshotKey1,
    comment: "nice job",
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    authorizationHeader: userData1.sessionKey,
  });
  const comment = createCommentResult.createComment.comment;
  expect(typeof comment.id).toBe("string");
  expect(comment.documentId).toBe(documentId1);
  expect(typeof comment.contentCiphertext).toBe("string");
  expect(typeof comment.contentNonce).toBe("string");
  expect(typeof comment.createdAt).toBe("string");
  expect(comment.creatorDevice.signingPublicKey).toBe(
    userData1.webDevice.signingPublicKey
  );
  expect(comment.creatorDevice.encryptionPublicKey).toBe(
    userData1.webDevice.encryptionPublicKey
  );
});

test("editor comments", async () => {
  await prisma.usersToWorkspaces.updateMany({
    where: {
      userId: userData1.user.id,
      workspaceId: userData1.workspace.id,
    },
    data: {
      role: Role.EDITOR,
    },
  });
  const createCommentResult = await createComment({
    graphql,
    snapshotId: snapshotId1,
    snapshotKey: snapshotKey1,
    comment: "nice job",
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    authorizationHeader: userData1.sessionKey,
  });
  const comment = createCommentResult.createComment.comment;
  expect(typeof comment.id).toBe("string");
  expect(comment.documentId).toBe(documentId1);
  expect(typeof comment.contentCiphertext).toBe("string");
  expect(typeof comment.contentNonce).toBe("string");
  expect(typeof comment.createdAt).toBe("string");
  expect(comment.creatorDevice.signingPublicKey).toBe(
    userData1.webDevice.signingPublicKey
  );
  expect(comment.creatorDevice.encryptionPublicKey).toBe(
    userData1.webDevice.encryptionPublicKey
  );
});

test("commenter comment", async () => {
  await prisma.usersToWorkspaces.updateMany({
    where: {
      userId: userData1.user.id,
      workspaceId: userData1.workspace.id,
    },
    data: {
      role: Role.COMMENTER,
    },
  });
  const createCommentResult = await createComment({
    graphql,
    snapshotId: snapshotId1,
    snapshotKey: snapshotKey1,
    comment: "nice job",
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    authorizationHeader: userData1.sessionKey,
  });
  const comment = createCommentResult.createComment.comment;
  expect(typeof comment.id).toBe("string");
  expect(comment.documentId).toBe(documentId1);
  expect(typeof comment.contentCiphertext).toBe("string");
  expect(typeof comment.contentNonce).toBe("string");
  expect(typeof comment.createdAt).toBe("string");
  expect(comment.creatorDevice.signingPublicKey).toBe(
    userData1.webDevice.signingPublicKey
  );
  expect(comment.creatorDevice.encryptionPublicKey).toBe(
    userData1.webDevice.encryptionPublicKey
  );
});

test("viewer tries to comment", async () => {
  await prisma.usersToWorkspaces.updateMany({
    where: {
      userId: userData1.user.id,
      workspaceId: userData1.workspace.id,
    },
    data: {
      role: Role.VIEWER,
    },
  });
  await expect(
    (async () =>
      await createComment({
        graphql,
        snapshotId: snapshotId1,
        snapshotKey: snapshotKey1,
        comment: "nice job",
        creatorDevice: userData1.webDevice,
        creatorDeviceEncryptionPrivateKey:
          userData1.webDevice.encryptionPrivateKey,
        creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("unauthorized document", async () => {
  const otherUser = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password: "password",
  });
  await expect(
    (async () =>
      await createComment({
        graphql,
        snapshotId: snapshotId1,
        snapshotKey: snapshotKey1,
        comment: "nice job",
        creatorDevice: otherUser.device,
        creatorDeviceEncryptionPrivateKey: otherUser.deviceEncryptionPrivateKey,
        creatorDeviceSigningPrivateKey: otherUser.deviceSigningPrivateKey,
        authorizationHeader: otherUser.sessionKey,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("invalid document", async () => {
  const badSnapshotId = uuidv4();
  await expect(
    (async () =>
      await createComment({
        graphql,
        snapshotId: badSnapshotId,
        snapshotKey: snapshotKey1,
        comment: "nice job",
        creatorDevice: userData1.webDevice,
        creatorDeviceEncryptionPrivateKey:
          userData1.webDevice.encryptionPrivateKey,
        creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await createComment({
        graphql,
        snapshotId: snapshotId1,
        snapshotKey: snapshotKey1,
        comment: "nice job",
        creatorDevice: userData1.webDevice,
        creatorDeviceEncryptionPrivateKey:
          userData1.webDevice.encryptionPrivateKey,
        creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
        authorizationHeader: "badauthkey",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: sessionKey,
  };
  const query = gql`
    mutation createComment($input: CreateCommentInput!) {
      createComment(input: $input) {
        comment {
          id
          documentId
          contentCiphertext
          contentNonce
          createdAt
          creatorDevice {
            signingPublicKey
            encryptionPublicKey
            encryptionPublicKeySignature
            createdAt
          }
        }
      }
    }
  `;
  test("Invalid snapshotId", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              snapshotId: null,
              contentCiphertext: "abc",
              contentNonce: "abc",
              subkeyId: 42,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid contentCiphertext", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              snapshotId: snapshotId1,
              contentCiphertext: null,
              contentNonce: "abc",
              subkeyId: 42,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid contentNonce", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              snapshotId: snapshotId1,
              contentCiphertext: "abc",
              contentNonce: null,
              subkeyId: 42,
            },
          },
          authorizationHeaders
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
              snapshotId: snapshotId1,
              contentCiphertext: "abc",
              contentNonce: "abc",
              subkeyId: null,
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
});
