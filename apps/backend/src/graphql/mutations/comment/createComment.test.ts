import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
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
const password = "password22room5K42";

beforeAll(async () => {
  await deleteAllRecords();
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });

  documentId1 = userData1.document.id;
  snapshotId1 = userData1.snapshot.publicData.snapshotId;
  sessionKey = userData1.sessionKey;
  snapshotKey1 = userData1.snapshotKey.key;
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
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    documentId: documentId1,
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

test("shared editor comments", async () => {
  const userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password: "password",
  });
  const snapshotKey = sodium.to_base64(sodium.crypto_kdf_keygen());
  const { createDocumentShareLinkQueryResult } = await createDocumentShareLink({
    graphql,
    documentId: userData1.document.id,
    sharingRole: Role.EDITOR,
    mainDevice: userData1.mainDevice,
    snapshotKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  const documentShareLinkToken =
    createDocumentShareLinkQueryResult.createDocumentShareLink.token;
  const createCommentResult = await createComment({
    graphql,
    snapshotId: snapshotId1,
    snapshotKey: snapshotKey1,
    comment: "nice job",
    creatorDevice: userData2.webDevice,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    documentShareLinkToken,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
    documentId: userData1.document.id,
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
    username: `${generateId()}@example.com`,
    password: "password",
  });
  const snapshotKey = sodium.to_base64(sodium.crypto_kdf_keygen());
  const { createDocumentShareLinkQueryResult } = await createDocumentShareLink({
    graphql,
    documentId: userData1.document.id,
    sharingRole: Role.COMMENTER,
    mainDevice: userData1.mainDevice,
    snapshotKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  const documentShareLinkToken =
    createDocumentShareLinkQueryResult.createDocumentShareLink.token;
  const createCommentResult = await createComment({
    graphql,
    snapshotId: snapshotId1,
    snapshotKey: snapshotKey1,
    comment: "nice job",
    creatorDevice: userData2.webDevice,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    documentShareLinkToken,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
    documentId: userData1.document.id,
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
    username: `${generateId()}@example.com`,
    password: "password",
  });
  const snapshotKey = sodium.to_base64(sodium.crypto_kdf_keygen());
  const { createDocumentShareLinkQueryResult } = await createDocumentShareLink({
    graphql,
    documentId: userData1.document.id,
    sharingRole: Role.VIEWER,
    mainDevice: userData1.mainDevice,
    snapshotKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  const documentShareLinkToken =
    createDocumentShareLinkQueryResult.createDocumentShareLink.token;
  await expect(
    (async () =>
      await createComment({
        graphql,
        snapshotId: snapshotId1,
        snapshotKey: snapshotKey1,
        comment: "nice job",
        creatorDevice: userData2.webDevice,
        creatorDeviceEncryptionPrivateKey: userData2.deviceEncryptionPrivateKey,
        creatorDeviceSigningPrivateKey: userData2.deviceSigningPrivateKey,
        documentShareLinkToken,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData2.sessionKey,
        }).authorization,
        documentId: userData1.document.id,
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
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    documentId: userData1.document.id,
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
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    documentId: userData1.document.id,
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
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    documentId: userData1.document.id,
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
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
        documentId: userData1.document.id,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("unauthorized document", async () => {
  const otherUser = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password: "password",
  });
  await expect(
    (async () =>
      await createComment({
        graphql,
        snapshotId: snapshotId1,
        snapshotKey: snapshotKey1,
        comment: "nice job",
        creatorDevice: otherUser.webDevice,
        creatorDeviceEncryptionPrivateKey: otherUser.deviceEncryptionPrivateKey,
        creatorDeviceSigningPrivateKey: otherUser.deviceSigningPrivateKey,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: otherUser.sessionKey,
        }).authorization,
        documentId: userData1.document.id,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("invalid document", async () => {
  const badSnapshotId = generateId();
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
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
        documentId: userData1.document.id,
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
        documentId: userData1.document.id,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: deriveSessionAuthorization({ sessionKey }).authorization,
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
