import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import { createComment } from "../../../../test/helpers/comment/createComment";
import { createCommentReply } from "../../../../test/helpers/commentReply/createCommentReply";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
let comment: any = undefined;
let sessionKey = "";
let documentId1 = "";
const password = "password";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  documentId1 = userData1.document.id;
  sessionKey = userData1.sessionKey;

  const createCommentResult = await createComment({
    graphql,
    documentId: documentId1,
    comment: "nice job",
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingrivateKey,
    authorizationHeader: userData1.sessionKey,
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
    documentId: userData1.document.id,
    comment: "thanks",
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingrivateKey,
    authorizationHeader: userData1.sessionKey,
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
    documentId: userData1.document.id,
    comment: "thanks",
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingrivateKey,
    authorizationHeader: userData1.sessionKey,
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
    documentId: userData1.document.id,
    comment: "thanks",
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingrivateKey,
    authorizationHeader: userData1.sessionKey,
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
    documentId: userData1.document.id,
    comment: "thanks",
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingrivateKey,
    authorizationHeader: userData1.sessionKey,
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
        documentId: userData1.document.id,
        comment: "thanks",
        creatorDevice: userData1.webDevice,
        creatorDeviceEncryptionPrivateKey:
          userData1.webDevice.encryptionPrivateKey,
        creatorDeviceSigningPrivateKey: userData1.webDevice.signingrivateKey,
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
      await createCommentReply({
        graphql,
        commentId: comment.id,
        documentId: userData1.document.id,
        comment: "thanks",
        creatorDevice: otherUser.device,
        creatorDeviceEncryptionPrivateKey: otherUser.deviceEncryptionPrivateKey,
        creatorDeviceSigningPrivateKey: otherUser.deviceSigningPrivateKey,
        authorizationHeader: otherUser.sessionKey,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("invalid document", async () => {
  const badDocumentId = uuidv4();
  await expect(
    (async () =>
      await createCommentReply({
        graphql,
        commentId: comment.id,
        documentId: badDocumentId,
        comment: "nice job",
        creatorDevice: userData1.webDevice,
        creatorDeviceEncryptionPrivateKey:
          userData1.webDevice.encryptionPrivateKey,
        creatorDeviceSigningPrivateKey: userData1.webDevice.signingrivateKey,
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await createCommentReply({
        graphql,
        commentId: comment.id,
        documentId: documentId1,
        comment: "nice job",
        creatorDevice: userData1.webDevice,
        creatorDeviceEncryptionPrivateKey:
          userData1.webDevice.encryptionPrivateKey,
        creatorDeviceSigningPrivateKey: userData1.webDevice.signingrivateKey,
        authorizationHeader: "badauthkey",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: sessionKey,
  };
  const query = gql`
    mutation createCommentReply($input: CreateCommentReplyInput!) {
      createCommentReply(input: $input) {
        commentReply {
          id
          commentId
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
  test("Invalid commentId", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              commentId: null,
              documentId: "",
              contentCiphertext: "",
              contentNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: 1,
                subkeyId: 1,
                parentFolders: [],
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
              commentId: uuidv4(),
              documentId: null,
              contentCiphertext: "",
              contentNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: 1,
                subkeyId: 1,
                parentFolders: [],
              },
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
              commentId: uuidv4(),
              documentId: uuidv4(),
              contentCiphertext: null,
              contentNonce: "",
              keyDerivationTrace: {
                workspaceKeyId: 1,
                subkeyId: 1,
                parentFolders: [],
              },
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
              commentId: uuidv4(),
              documentId: uuidv4(),
              contentCiphertext: "",
              contentNonce: null,
              keyDerivationTrace: {
                workspaceKeyId: 1,
                subkeyId: 1,
                parentFolders: [],
              },
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid keyDerivationTrace", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              commentId: uuidv4(),
              documentId: uuidv4(),
              contentCiphertext: "",
              contentNonce: null,
              keyDerivationTrace: null,
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
