import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import { createComment } from "../../../../test/helpers/comment/createComment";
import { deleteComments } from "../../../../test/helpers/comment/deleteComments";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { attachUserToWorkspace } from "../../../../test/helpers/workspace/attachUserToWorkspace";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any;
let userData2: any;

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password: "password",
  });
  userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password: "password",
  });
  await attachUserToWorkspace({
    graphql,
    hostUserId: userData1.user.id,
    hostSessionKey: userData1.sessionKey,
    hostWebDevice: userData1.webDevice,
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
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("commenter deletes own comment", async () => {
  const commentResult = await createComment({
    graphql,
    documentId: userData1.document.id,
    comment: "comment 1",
    creatorDevice: userData1.webDevice,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    authorizationHeader: userData1.sessionKey,
  });
  const comment = commentResult.createComment.comment;
  const numCommentsBeforeDelete = await prisma.comment.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsBeforeDelete).toBe(1);
  const deleteCommentsResult = await deleteComments({
    graphql,
    commentIds: [comment.id],
    authorizationHeader: userData1.sessionKey,
  });
  expect(deleteCommentsResult.deleteComments.status).toBe("success");
  const numCommentsAfterDelete = await prisma.comment.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsAfterDelete).toBe(0);
});

test("admin deletes comment", async () => {
  await prisma.usersToWorkspaces.updateMany({
    where: {
      workspaceId: userData1.workspace.id,
      userId: userData1.user.id,
    },
    data: {
      role: Role.ADMIN,
    },
  });
  const commentResult = await createComment({
    graphql,
    documentId: userData1.document.id,
    comment: "comment 1",
    creatorDevice: userData2.webDevice,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    authorizationHeader: userData2.sessionKey,
  });
  const comment = commentResult.createComment.comment;
  const numCommentsBeforeDelete = await prisma.comment.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsBeforeDelete).toBe(1);
  const deleteCommentsResult = await deleteComments({
    graphql,
    commentIds: [comment.id],
    authorizationHeader: userData1.sessionKey,
  });
  expect(deleteCommentsResult.deleteComments.status).toBe("success");
  const numCommentsAfterDelete = await prisma.comment.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsAfterDelete).toBe(0);
});

test("editor deletes comment", async () => {
  await prisma.usersToWorkspaces.updateMany({
    where: {
      workspaceId: userData1.workspace.id,
      userId: userData1.user.id,
    },
    data: {
      role: Role.EDITOR,
    },
  });
  const commentResult = await createComment({
    graphql,
    documentId: userData1.document.id,
    comment: "comment 1",
    creatorDevice: userData2.webDevice,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    authorizationHeader: userData2.sessionKey,
  });
  const comment = commentResult.createComment.comment;
  const numCommentsBeforeDelete = await prisma.comment.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsBeforeDelete).toBe(1);
  const deleteCommentsResult = await deleteComments({
    graphql,
    commentIds: [comment.id],
    authorizationHeader: userData1.sessionKey,
  });
  expect(deleteCommentsResult.deleteComments.status).toBe("success");
  const numCommentsAfterDelete = await prisma.comment.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsAfterDelete).toBe(0);
});

test("commentor tries to delete other comment", async () => {
  await prisma.usersToWorkspaces.updateMany({
    where: {
      workspaceId: userData1.workspace.id,
      userId: userData1.user.id,
    },
    data: {
      role: Role.COMMENTER,
    },
  });
  const commentResult = await createComment({
    graphql,
    documentId: userData1.document.id,
    comment: "comment 1",
    creatorDevice: userData2.webDevice,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    authorizationHeader: userData2.sessionKey,
  });
  const comment = commentResult.createComment.comment;
  expect(
    (async () => {
      await deleteComments({
        graphql,
        commentIds: [comment.id],
        authorizationHeader: userData1.sessionKey,
      });
    })()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("viewer tries to delete other comment", async () => {
  await prisma.usersToWorkspaces.updateMany({
    where: {
      workspaceId: userData1.workspace.id,
      userId: userData1.user.id,
    },
    data: {
      role: Role.VIEWER,
    },
  });
  const commentResult = await createComment({
    graphql,
    documentId: userData1.document.id,
    comment: "comment 1",
    creatorDevice: userData2.webDevice,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    authorizationHeader: userData2.sessionKey,
  });
  const comment = commentResult.createComment.comment;
  expect(
    (async () => {
      await deleteComments({
        graphql,
        commentIds: [comment.id],
        authorizationHeader: userData1.sessionKey,
      });
    })()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("delete some comments", async () => {
  const commentResult = await createComment({
    graphql,
    documentId: userData1.document.id,
    comment: "comment three",
    creatorDevice: userData2.webDevice,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    authorizationHeader: userData2.sessionKey,
  });
  const comment = commentResult.createComment.comment;
  const numCommentsBeforeDelete = await prisma.comment.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsBeforeDelete).toBeGreaterThanOrEqual(1);
  const deleteCommentsResult = await deleteComments({
    graphql,
    commentIds: [comment.id],
    authorizationHeader: userData2.sessionKey,
  });
  expect(deleteCommentsResult.deleteComments.status).toBe("success");
  const numCommentsAfterDelete = await prisma.comment.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsAfterDelete).toBeGreaterThanOrEqual(1);
  expect(numCommentsAfterDelete).toBe(numCommentsBeforeDelete - 1);
});

test("cant delete comments on outside document", async () => {
  const commentResult = await createComment({
    graphql,
    documentId: userData1.document.id,
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
  const comment = commentResult.createComment.comment;
  expect(
    (async () => {
      await deleteComments({
        graphql,
        commentIds: [comment.id],
        authorizationHeader: userData2.sessionKey,
      });
    })()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("invalid comment", async () => {
  expect(
    (async () => {
      await deleteComments({
        graphql,
        commentIds: ["bad-id"],
        authorizationHeader: userData1.sessionKey,
      });
    })()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("no comments", async () => {
  const numCommentsBeforeDelete = await prisma.comment.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsBeforeDelete).toBeGreaterThanOrEqual(1);
  const deleteCommentsResult = await deleteComments({
    graphql,
    commentIds: [],
    authorizationHeader: userData2.sessionKey,
  });
  expect(deleteCommentsResult.deleteComments.status).toBe("success");
  const numCommentsAfterDelete = await prisma.comment.count({
    where: { documentId: userData1.document.id },
  });
  expect(numCommentsAfterDelete).toBeGreaterThanOrEqual(1);
  expect(numCommentsAfterDelete).toBe(numCommentsBeforeDelete);
});

test("unauthorized", async () => {
  await expect(
    (async () =>
      deleteComments({
        graphql,
        commentIds: ["bad-id"],
        authorizationHeader: "badauthkey",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});