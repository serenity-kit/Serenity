import { generateId } from "@serenity-tools/common";
import { Role } from "../../../../prisma/generated/output";
import { createComment } from "../../../../test/helpers/comment/createComment";
import { createCommentReply } from "../../../../test/helpers/commentReply/createCommentReply";
import { deleteCommentReplies } from "../../../../test/helpers/commentReply/deleteCommentReplies";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { attachUserToWorkspace } from "../../../../test/helpers/workspace/attachUserToWorkspace";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any;
let userData2: any;
let user1Comment: any;
let user2Comment: any;

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password: "password",
  });
  userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password: "password",
  });
  await attachUserToWorkspace({
    graphql,
    hostUserId: userData1.user.id,
    hostSessionKey: userData1.sessionKey,
    hostWebDevice: userData1.webDevice,
    hostMainDevice: userData1.mainDevice,
    guestUserId: userData2.user.id,
    guestSessionKey: userData2.sessionKey,
    guestMainDevice: {
      ...userData2.mainDevice,
      signingPrivateKey: userData2.deviceSigningPrivateKey,
      encryptionPrivateKey: userData2.deviceEncryptionPrivateKey,
    },
    guestWebDevice: userData2.webDevice,
    workspaceId: userData1.workspace.id,
    role: Role.ADMIN,
  });
  const user1CommentResult = await createComment({
    graphql,
    snapshotId: userData1.snapshot.publicData.snapshotId,
    snapshotKey: userData1.snapshotKey.key,
    comment: "comment 1",
    creatorDevice: userData1.webDevice,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    authorizationHeader: userData1.sessionKey,
  });
  user1Comment = user1CommentResult.createComment.comment;
  const user2CommentResult = await createComment({
    graphql,
    snapshotId: userData1.snapshot.publicData.snapshotId,
    snapshotKey: userData1.snapshotKey.key,
    comment: "comment 1",
    creatorDevice: userData2.webDevice,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    authorizationHeader: userData2.sessionKey,
  });
  user2Comment = user2CommentResult.createComment.comment;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("commenter deletes own reply", async () => {
  const commentReplyResult = await createCommentReply({
    graphql,
    commentId: user1Comment.id,
    snapshotId: userData1.snapshot.publicData.snapshotId,
    snapshotKey: userData1.snapshotKey.key,
    comment: "good point",
    creatorDevice: userData1.webDevice,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    authorizationHeader: userData1.sessionKey,
  });
  const commentReply = commentReplyResult.createCommentReply.commentReply;
  const numCommentsBeforeDelete = await prisma.commentReply.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsBeforeDelete).toBe(1);
  const deleteCommentRepliesResult = await deleteCommentReplies({
    graphql,
    commentReplyIds: [commentReply.id],
    authorizationHeader: userData1.sessionKey,
  });
  expect(deleteCommentRepliesResult.deleteCommentReplies.status).toBe(
    "success"
  );
  const numCommentsAfterDelete = await prisma.commentReply.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsAfterDelete).toBe(0);
});

test("admin deletes reply", async () => {
  await prisma.usersToWorkspaces.updateMany({
    where: {
      workspaceId: userData1.workspace.id,
      userId: userData1.user.id,
    },
    data: {
      role: Role.ADMIN,
    },
  });
  const commentReplyResult = await createCommentReply({
    graphql,
    commentId: user1Comment.id,
    snapshotId: userData1.snapshot.publicData.snapshotId,
    snapshotKey: userData1.snapshotKey.key,
    comment: "comment 1",
    creatorDevice: userData2.webDevice,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    authorizationHeader: userData2.sessionKey,
  });
  const commentReply = commentReplyResult.createCommentReply.commentReply;
  const numCommentsBeforeDelete = await prisma.commentReply.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsBeforeDelete).toBe(1);
  const deleteCommentRepliesResult = await deleteCommentReplies({
    graphql,
    commentReplyIds: [commentReply.id],
    authorizationHeader: userData1.sessionKey,
  });
  expect(deleteCommentRepliesResult.deleteCommentReplies.status).toBe(
    "success"
  );
  const numCommentsAfterDelete = await prisma.commentReply.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsAfterDelete).toBe(0);
});

test("editor deletes reply", async () => {
  await prisma.usersToWorkspaces.updateMany({
    where: {
      workspaceId: userData1.workspace.id,
      userId: userData1.user.id,
    },
    data: {
      role: Role.EDITOR,
    },
  });
  const commentReplyResult = await createCommentReply({
    graphql,
    commentId: user1Comment.id,
    snapshotId: userData1.snapshot.publicData.snapshotId,
    snapshotKey: userData1.snapshotKey.key,
    comment: "comment 1",
    creatorDevice: userData2.webDevice,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    authorizationHeader: userData2.sessionKey,
  });
  const commentReply = commentReplyResult.createCommentReply.commentReply;
  const numCommentsBeforeDelete = await prisma.commentReply.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsBeforeDelete).toBe(1);
  const deleteCommentRepliesResult = await deleteCommentReplies({
    graphql,
    commentReplyIds: [commentReply.id],
    authorizationHeader: userData1.sessionKey,
  });
  expect(deleteCommentRepliesResult.deleteCommentReplies.status).toBe(
    "success"
  );
  const numCommentsAfterDelete = await prisma.commentReply.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsAfterDelete).toBe(0);
});

test("commentor tries to delete other reply", async () => {
  await prisma.usersToWorkspaces.updateMany({
    where: {
      workspaceId: userData1.workspace.id,
      userId: userData1.user.id,
    },
    data: {
      role: Role.COMMENTER,
    },
  });
  const commentReplyResult = await createCommentReply({
    graphql,
    commentId: user1Comment.id,
    snapshotId: userData1.snapshot.publicData.snapshotId,
    snapshotKey: userData1.snapshotKey.key,
    comment: "comment 1",
    creatorDevice: userData2.webDevice,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    authorizationHeader: userData2.sessionKey,
  });
  const commentReply = commentReplyResult.createCommentReply.commentReply;
  expect(
    (async () => {
      await deleteCommentReplies({
        graphql,
        commentReplyIds: [commentReply.id],
        authorizationHeader: userData1.sessionKey,
      });
    })()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("viewer tries to delete other reply", async () => {
  await prisma.usersToWorkspaces.updateMany({
    where: {
      workspaceId: userData1.workspace.id,
      userId: userData1.user.id,
    },
    data: {
      role: Role.VIEWER,
    },
  });
  const commentReplyResult = await createCommentReply({
    graphql,
    commentId: user1Comment.id,
    snapshotId: userData1.snapshot.publicData.snapshotId,
    snapshotKey: userData1.snapshotKey.key,
    comment: "comment 1",
    creatorDevice: userData2.webDevice,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    authorizationHeader: userData2.sessionKey,
  });
  const commentReply = commentReplyResult.createCommentReply.commentReply;
  expect(
    (async () => {
      await deleteCommentReplies({
        graphql,
        commentReplyIds: [commentReply.id],
        authorizationHeader: userData1.sessionKey,
      });
    })()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("delete some replies", async () => {
  const commentReplyResult = await createCommentReply({
    graphql,
    commentId: user1Comment.id,
    snapshotId: userData1.snapshot.publicData.snapshotId,
    snapshotKey: userData1.snapshotKey.key,
    comment: "comment three",
    creatorDevice: userData2.webDevice,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    authorizationHeader: userData2.sessionKey,
  });
  const commentReply = commentReplyResult.createCommentReply.commentReply;
  const numCommentsBeforeDelete = await prisma.commentReply.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsBeforeDelete).toBeGreaterThanOrEqual(1);
  const deleteCommentRepliesResult = await deleteCommentReplies({
    graphql,
    commentReplyIds: [commentReply.id],
    authorizationHeader: userData2.sessionKey,
  });
  expect(deleteCommentRepliesResult.deleteCommentReplies.status).toBe(
    "success"
  );
  const numCommentsAfterDelete = await prisma.commentReply.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsAfterDelete).toBeGreaterThanOrEqual(1);
  expect(numCommentsAfterDelete).toBe(numCommentsBeforeDelete - 1);
});

test("cant delete replies on outside document", async () => {
  const commentReplyResult = await createCommentReply({
    graphql,
    commentId: user1Comment.id,
    snapshotId: userData1.snapshot.publicData.snapshotId,
    snapshotKey: userData1.snapshotKey.key,
    comment: "comment three",
    creatorDevice: userData2.webDevice,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    authorizationHeader: userData2.sessionKey,
  });
  await prisma.usersToWorkspaces.deleteMany({
    where: {
      workspaceId: userData1.workspace.id,
      userId: userData2.user.id,
    },
  });
  const commentReply = commentReplyResult.createCommentReply.commentReply;
  expect(
    (async () => {
      await deleteCommentReplies({
        graphql,
        commentReplyIds: [commentReply.id],
        authorizationHeader: userData2.sessionKey,
      });
    })()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("invalid reply", async () => {
  expect(
    (async () => {
      await deleteCommentReplies({
        graphql,
        commentReplyIds: ["bad-id"],
        authorizationHeader: userData1.sessionKey,
      });
    })()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("no replies", async () => {
  const numCommentsBeforeDelete = await prisma.commentReply.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsBeforeDelete).toBeGreaterThanOrEqual(1);
  const deleteCommentRepliesResult = await deleteCommentReplies({
    graphql,
    commentReplyIds: [],
    authorizationHeader: userData2.sessionKey,
  });
  expect(deleteCommentRepliesResult.deleteCommentReplies.status).toBe(
    "success"
  );
  const numCommentsAfterDelete = await prisma.commentReply.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsAfterDelete).toBeGreaterThanOrEqual(1);
  expect(numCommentsAfterDelete).toBe(numCommentsBeforeDelete);
});

test("unauthorized", async () => {
  await expect(
    (async () =>
      deleteCommentReplies({
        graphql,
        commentReplyIds: ["bad-id"],
        authorizationHeader: "badauthkey",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
