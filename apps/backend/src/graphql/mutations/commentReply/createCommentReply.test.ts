import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { Role } from "../../../../prisma/generated/output";
import { createComment } from "../../../../test/helpers/comment/createComment";
import { createCommentReply } from "../../../../test/helpers/commentReply/createCommentReply";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocumentShareLink } from "../../../../test/helpers/document/createDocumentShareLink";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
let comment: any = undefined;
let sessionKey = "";
let documentId1 = "";
let snapshotId1 = "";
let snapshotKey1 = "";
const password = "password22room5K42";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  documentId1 = userData1.document.id;
  sessionKey = userData1.sessionKey;
  snapshotId1 = userData1.snapshot.publicData.snapshotId;
  snapshotKey1 = userData1.snapshotKey.key;

  const createCommentResult = await createComment({
    graphql,
    snapshotId: userData1.snapshot.publicData.snapshotId,
    snapshotKey: userData1.snapshotKey.key,
    comment: "nice job",
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingrivateKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    documentId: userData1.document.id,
    workspaceId: userData1.workspace.id,
    userId: userData1.user.id,
  });
  comment = createCommentResult.createComment.comment;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("commenter responds to comment", async () => {
  const createCommentReplyResult = await createCommentReply({
    graphql,
    commentId: comment.id,
    snapshotId: snapshotId1,
    snapshotKey: snapshotKey1,
    comment: "thanks",
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    documentId: userData1.document.id,
    workspaceId: userData1.workspace.id,
    userId: userData1.user.id,
  });
  const commentReply = createCommentReplyResult.createCommentReply.commentReply;
  expect(typeof commentReply.id).toBe("string");
  expect(commentReply.commentId).toBe(comment.id);
  expect(commentReply.documentId).toBe(documentId1);
  expect(typeof commentReply.contentCiphertext).toBe("string");
  expect(typeof commentReply.contentNonce).toBe("string");
  expect(commentReply.creatorDevice.signingPublicKey).toBe(
    userData1.webDevice.signingPublicKey
  );
  expect(commentReply.creatorDevice.encryptionPublicKey).toBe(
    userData1.webDevice.encryptionPublicKey
  );
});

test("shared editor responds to comment", async () => {
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
  const createCommentReplyResult = await createCommentReply({
    graphql,
    commentId: comment.id,
    snapshotId: snapshotId1,
    documentShareLinkToken,
    snapshotKey: snapshotKey1,
    comment: "thanks",
    creatorDevice: userData2.webDevice,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
    documentId: userData1.document.id,
  });
  const commentReply = createCommentReplyResult.createCommentReply.commentReply;
  expect(typeof commentReply.id).toBe("string");
  expect(commentReply.commentId).toBe(comment.id);
  expect(commentReply.documentId).toBe(documentId1);
  expect(typeof commentReply.contentCiphertext).toBe("string");
  expect(typeof commentReply.contentNonce).toBe("string");
  expect(commentReply.creatorDevice.signingPublicKey).toBe(
    userData2.webDevice.signingPublicKey
  );
  expect(commentReply.creatorDevice.encryptionPublicKey).toBe(
    userData2.webDevice.encryptionPublicKey
  );
});

test("shared commenter responds to comment", async () => {
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
  const createCommentReplyResult = await createCommentReply({
    graphql,
    commentId: comment.id,
    snapshotId: snapshotId1,
    documentShareLinkToken,
    snapshotKey: snapshotKey1,
    comment: "thanks",
    creatorDevice: userData2.webDevice,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
    documentId: userData1.document.id,
  });
  const commentReply = createCommentReplyResult.createCommentReply.commentReply;
  expect(typeof commentReply.id).toBe("string");
  expect(commentReply.commentId).toBe(comment.id);
  expect(commentReply.documentId).toBe(documentId1);
  expect(typeof commentReply.contentCiphertext).toBe("string");
  expect(typeof commentReply.contentNonce).toBe("string");
  expect(commentReply.creatorDevice.signingPublicKey).toBe(
    userData2.webDevice.signingPublicKey
  );
  expect(commentReply.creatorDevice.encryptionPublicKey).toBe(
    userData2.webDevice.encryptionPublicKey
  );
});

test("shared viewer cannot respond to comment", async () => {
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
      await createCommentReply({
        graphql,
        commentId: comment.id,
        snapshotId: snapshotId1,
        documentShareLinkToken,
        snapshotKey: snapshotKey1,
        comment: "thanks",
        creatorDevice: userData1.webDevice,
        creatorDeviceEncryptionPrivateKey:
          userData1.webDevice.encryptionPrivateKey,
        creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
        documentId: userData1.document.id,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("admin replies to comment", async () => {
  await prisma.usersToWorkspaces.updateMany({
    where: {
      userId: userData1.user.id,
      workspaceId: userData1.workspace.id,
    },
    data: {
      role: Role.ADMIN,
    },
  });
  const createCommentReplyResult = await createCommentReply({
    graphql,
    commentId: comment.id,
    snapshotId: snapshotId1,
    snapshotKey: snapshotKey1,
    comment: "thanks",
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    documentId: userData1.document.id,
    workspaceId: userData1.workspace.id,
    userId: userData1.user.id,
  });
  const commentReply = createCommentReplyResult.createCommentReply.commentReply;
  expect(typeof commentReply.id).toBe("string");
  expect(commentReply.commentId).toBe(comment.id);
  expect(commentReply.documentId).toBe(documentId1);
  expect(typeof commentReply.contentCiphertext).toBe("string");
  expect(typeof commentReply.contentNonce).toBe("string");
  expect(typeof commentReply.createdAt).toBe("string");
  expect(commentReply.creatorDevice.signingPublicKey).toBe(
    userData1.webDevice.signingPublicKey
  );
  expect(commentReply.creatorDevice.encryptionPublicKey).toBe(
    userData1.webDevice.encryptionPublicKey
  );
});

test("editor replies to comment", async () => {
  await prisma.usersToWorkspaces.updateMany({
    where: {
      userId: userData1.user.id,
      workspaceId: userData1.workspace.id,
    },
    data: {
      role: Role.EDITOR,
    },
  });
  const createCommentReplyResult = await createCommentReply({
    graphql,
    commentId: comment.id,
    snapshotId: snapshotId1,
    snapshotKey: snapshotKey1,
    comment: "thanks",
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    documentId: userData1.document.id,
    workspaceId: userData1.workspace.id,
    userId: userData1.user.id,
  });
  const commentReply = createCommentReplyResult.createCommentReply.commentReply;
  expect(typeof commentReply.id).toBe("string");
  expect(commentReply.commentId).toBe(comment.id);
  expect(commentReply.documentId).toBe(documentId1);
  expect(typeof commentReply.contentCiphertext).toBe("string");
  expect(typeof commentReply.contentNonce).toBe("string");
  expect(typeof commentReply.createdAt).toBe("string");
  expect(commentReply.creatorDevice.signingPublicKey).toBe(
    userData1.webDevice.signingPublicKey
  );
  expect(commentReply.creatorDevice.encryptionPublicKey).toBe(
    userData1.webDevice.encryptionPublicKey
  );
});

test("commenter replies to comment", async () => {
  await prisma.usersToWorkspaces.updateMany({
    where: {
      userId: userData1.user.id,
      workspaceId: userData1.workspace.id,
    },
    data: {
      role: Role.COMMENTER,
    },
  });
  const createCommentReplyResult = await createCommentReply({
    graphql,
    commentId: comment.id,
    snapshotId: snapshotId1,
    snapshotKey: snapshotKey1,
    comment: "thanks",
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    documentId: userData1.document.id,
    workspaceId: userData1.workspace.id,
    userId: userData1.user.id,
  });
  const commentReply = createCommentReplyResult.createCommentReply.commentReply;
  expect(typeof commentReply.id).toBe("string");
  expect(commentReply.commentId).toBe(comment.id);
  expect(commentReply.documentId).toBe(documentId1);
  expect(typeof commentReply.contentCiphertext).toBe("string");
  expect(typeof commentReply.contentNonce).toBe("string");
  expect(typeof commentReply.createdAt).toBe("string");
  expect(commentReply.creatorDevice.signingPublicKey).toBe(
    userData1.webDevice.signingPublicKey
  );
  expect(commentReply.creatorDevice.encryptionPublicKey).toBe(
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
      await createCommentReply({
        graphql,
        commentId: comment.id,
        snapshotId: snapshotId1,
        snapshotKey: snapshotKey1,
        comment: "thanks",
        creatorDevice: userData1.webDevice,
        creatorDeviceEncryptionPrivateKey:
          userData1.webDevice.encryptionPrivateKey,
        creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
        documentId: userData1.document.id,
        workspaceId: userData1.workspace.id,
        userId: userData1.user.id,
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
      await createCommentReply({
        graphql,
        commentId: comment.id,
        snapshotId: snapshotId1,
        snapshotKey: snapshotKey1,
        comment: "thanks",
        creatorDevice: otherUser.webDevice,
        creatorDeviceEncryptionPrivateKey: otherUser.deviceEncryptionPrivateKey,
        creatorDeviceSigningPrivateKey: otherUser.deviceSigningPrivateKey,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: otherUser.sessionKey,
        }).authorization,
        documentId: userData1.document.id,
        workspaceId: userData1.workspace.id,
        userId: userData1.user.id,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("invalid document", async () => {
  const badSnapshotId = generateId();
  await expect(
    (async () =>
      await createCommentReply({
        graphql,
        commentId: comment.id,
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
        workspaceId: userData1.workspace.id,
        userId: userData1.user.id,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("invalid commentId", async () => {
  const badCommentId = generateId();
  await expect(
    (async () =>
      await createCommentReply({
        graphql,
        commentId: badCommentId,
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
        workspaceId: userData1.workspace.id,
        userId: userData1.user.id,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await createCommentReply({
        graphql,
        commentId: comment.id,
        snapshotId: snapshotId1,
        snapshotKey: snapshotKey1,
        comment: "nice job",
        creatorDevice: userData1.webDevice,
        creatorDeviceEncryptionPrivateKey:
          userData1.webDevice.encryptionPrivateKey,
        creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
        authorizationHeader: "badauthkey",
        documentId: userData1.document.id,
        workspaceId: userData1.workspace.id,
        userId: userData1.user.id,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: deriveSessionAuthorization({ sessionKey }).authorization,
  };
  const query = gql`
    mutation createCommentReply($input: CreateCommentReplyInput!) {
      createCommentReply(input: $input) {
        commentReply {
          id
          commentId
          documentId
          snapshotId
          subkeyId
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
  test("Invalid commentId", async () => {
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          {
            input: {
              commentId: null,
              snapshotId: snapshotId1,
              subkeyId: 42,
              contentCiphertext: "",
              contentNonce: "",
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid snapshotId", async () => {
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          {
            input: {
              commentId: generateId(),
              snapshotId: null,
              subkeyId: 42,
              contentCiphertext: "",
              contentNonce: "",
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid subkeyId", async () => {
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          {
            input: {
              commentId: generateId(),
              snapshotId: snapshotId1,
              subkeyId: null,
              contentCiphertext: "",
              contentNonce: "",
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });

  test("Invalid contentCiphertext", async () => {
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          {
            input: {
              commentId: generateId(),
              snapshotId: snapshotId1,
              subkeyId: 42,
              contentCiphertext: null,
              contentNonce: "",
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid contentNonce", async () => {
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          {
            input: {
              commentId: generateId(),
              snapshotId: snapshotId1,
              subkeyId: 42,
              contentCiphertext: "",
              contentNonce: null,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid keyDerivationTrace", async () => {
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          {
            input: {
              commentId: generateId(),
              snapshotId: snapshotId1,
              subkeyId: 42,
              contentCiphertext: "",
              contentNonce: null,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    await expect(
      (async () =>
        await graphql.client.request<any>(
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
        await graphql.client.request<any>(
          query,
          undefined,
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
