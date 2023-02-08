import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import { createComment } from "../../../../test/helpers/comment/createComment";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
let documentId1;
const password = "password";
let userData: any = null;
let addedWorkspace: any = null;
let addedFolder: any = null;
let sessionKey = "";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  sessionKey = userData1.sessionKey;
  addedWorkspace = userData1.workspace;
  addedFolder = userData1.folder;
  documentId1 = userData1.document.id;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("owner comments", async () => {
  const createCommentResult = await createComment({
    graphql,
    documentId: documentId1,
    comment: "nice job",
    creatorDevice: userData1.device,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.deviceSigningPrivateKey,
    authorizationHeader: userData1.sessionKey,
  });
  const comment = createCommentResult.createComment;
  expect(typeof comment.id).toBe("string");
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
    documentId: documentId1,
    comment: "nice job",
    creatorDevice: userData1.device,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.deviceSigningPrivateKey,
    authorizationHeader: userData1.sessionKey,
  });
  const comment = createCommentResult.createComment;
  expect(typeof comment.id).toBe("string");
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
    documentId: documentId1,
    comment: "nice job",
    creatorDevice: userData1.device,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.deviceSigningPrivateKey,
    authorizationHeader: userData1.sessionKey,
  });
  const comment = createCommentResult.createComment;
  expect(typeof comment.id).toBe("string");
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
    documentId: documentId1,
    comment: "nice job",
    creatorDevice: userData1.device,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    creatorDeviceSigningPrivateKey: userData1.deviceSigningPrivateKey,
    authorizationHeader: userData1.sessionKey,
  });
  const comment = createCommentResult.createComment;
  expect(typeof comment.id).toBe("string");
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
        documentId: documentId1,
        comment: "nice job",
        creatorDevice: userData1.device,
        creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
        creatorDeviceSigningPrivateKey: userData1.deviceSigningPrivateKey,
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
        documentId: documentId1,
        comment: "nice job",
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
      await createComment({
        graphql,
        documentId: badDocumentId,
        comment: "nice job",
        creatorDevice: userData1.device,
        creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
        creatorDeviceSigningPrivateKey: userData1.deviceSigningPrivateKey,
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await createComment({
        graphql,
        documentId: documentId1,
        comment: "nice job",
        creatorDevice: userData1.device,
        creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
        creatorDeviceSigningPrivateKey: userData1.deviceSigningPrivateKey,
        authorizationHeader: "badauthkey",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: sessionKey,
  };
  const id = uuidv4();
  const query = gql`
    mutation createComment($input: CreateCommentInput!) {
      createComment(input: $input) {
        id
      }
    }
  `;
  test("Invalid documentId", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              documentId: null,
              encryptedContent: "",
              encryptedContentNonce: "",
              contentKeyDerivationTrace: {
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
  test("Invalid encryptedContent", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              id: uuidv4(),
              encryptedContent: null,
              encryptedContentNonce: "",
              contentKeyDerivationTrace: {
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
  test("Invalid encryptedContentNonce", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              id: uuidv4(),
              encryptedContent: "",
              encryptedContentNonce: null,
              contentKeyDerivationTrace: {
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
  test("Invalid contentKeyDerivationTrace", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              id: uuidv4(),
              encryptedContent: "",
              encryptedContentNonce: null,
              contentKeyDerivationTrace: null,
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
