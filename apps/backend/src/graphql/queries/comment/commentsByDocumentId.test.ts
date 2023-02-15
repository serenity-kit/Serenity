import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import { commentsByDocumentId } from "../../../../test/helpers/comment/commentsByDocumentId";
import { createComment } from "../../../../test/helpers/comment/createComment";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocumentShareLink } from "../../../../test/helpers/document/createDocumentShareLink";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
let sessionKey = "";
let documentId1 = "";
let comment1: any = undefined;
let comment2: any = undefined;
const password = "password";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  documentId1 = userData1.document.id;
  sessionKey = userData1.sessionKey;
  // create two comments
  const comment1Result = await createComment({
    graphql,
    documentId: userData1.document.id,
    comment: "comment 1",
    creatorDevice: userData1.webDevice,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    authorizationHeader: userData1.sessionKey,
  });
  comment1 = comment1Result.createComment.comment;
  const comment2Result = await createComment({
    graphql,
    documentId: userData1.document.id,
    comment: "comment 2",
    creatorDevice: userData1.webDevice,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    authorizationHeader: userData1.sessionKey,
  });
  comment2 = comment2Result.createComment.comment;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("one comment", async () => {
  const result = await commentsByDocumentId({
    graphql,
    documentId: userData1.document.id,
    deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
    first: 1,
    authorizationHeader: userData1.sessionKey,
  });
  const edges = result.commentsByDocumentId.edges;
  expect(edges.length).toBe(1);
  expect(edges[0].node.id).toBe(comment1.id);
  expect(edges[0].node.workspaceKey.id).toBe(
    userData1.workspace.currentWorkspaceKey.id
  );
  expect(edges[0].node.workspaceKey.workspaceKeyBox).not.toBe(null);
  const result2 = await commentsByDocumentId({
    graphql,
    documentId: userData1.document.id,
    deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
    first: 1,
    after: result.commentsByDocumentId.pageInfo.endCursor,
    authorizationHeader: userData1.sessionKey,
  });
  const edges2 = result2.commentsByDocumentId.edges;
  expect(edges2.length).toBe(1);
  expect(edges2[0].node.id).toBe(comment2.id);
  expect(edges2[0].node.workspaceKey.id).toBe(
    userData1.workspace.currentWorkspaceKey.id
  );
  expect(edges2[0].node.workspaceKey.workspaceKeyBox).not.toBe(null);
});

test("all comments", async () => {
  const result = await commentsByDocumentId({
    graphql,
    documentId: userData1.document.id,
    deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
    first: 50,
    authorizationHeader: userData1.sessionKey,
  });
  const edges = result.commentsByDocumentId.edges;
  expect(edges.length).toBe(2);
});

test("no deviceSigningPublicKey", async () => {
  await expect(
    (async () =>
      await commentsByDocumentId({
        graphql,
        documentId: userData1.document.id,
        first: 50,
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("bad document share token", async () => {
  await expect(
    (async () =>
      await commentsByDocumentId({
        graphql,
        documentId: userData1.document.id,
        deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
        documentShareLinkToken: "badtoken",
        first: 50,
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("no access to workspace", async () => {
  const userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  await expect(
    (async () =>
      await commentsByDocumentId({
        graphql,
        documentId: userData1.document.id,
        deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
        first: 50,
        authorizationHeader: userData2.sessionKey,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("document share token", async () => {
  const userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
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
  const result = await commentsByDocumentId({
    graphql,
    documentId: userData1.document.id,
    documentShareLinkToken,
    first: 50,
    authorizationHeader: userData2.sessionKey,
  });
  const edges = result.commentsByDocumentId.edges;
  expect(edges.length).toBe(2);
});

test("too many", async () => {
  await expect(
    (async () =>
      await commentsByDocumentId({
        graphql,
        documentId: userData1.document.id,
        first: 51,
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("unauthenticated", async () => {
  await expect(
    (async () =>
      await commentsByDocumentId({
        graphql,
        documentId: userData1.document.id,
        first: 50,
        authorizationHeader: "badsessionkey",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input Errors", () => {
  const authorizationHeaders = {
    authorization: sessionKey,
  };

  const query = gql`
    query commentsByDocumentId(
      $documentId: ID!
      $documentShareLinkToken: String
      $deviceSigningPublicKey: String
      $first: Int!
      $after: String
    ) {
      commentsByDocumentId(
        documentId: $documentId
        documentShareLinkToken: $documentShareLinkToken
        deviceSigningPublicKey: $deviceSigningPublicKey
        first: $first
        after: $after
      ) {
        edges {
          node {
            id
            documentId
            contentCiphertext
            contentNonce
            keyDerivationTrace {
              workspaceKeyId
              trace {
                entryId
                subkeyId
                context
                parentId
              }
            }
            workspaceKey {
              id
              workspaceId
              generation
              workspaceKeyBox {
                id
                workspaceKeyId
                deviceSigningPublicKey
                creatorDeviceSigningPublicKey
                nonce
                ciphertext
                creatorDevice {
                  signingPublicKey
                  encryptionPublicKey
                  encryptionPublicKeySignature
                  createdAt
                }
              }
            }
            creatorDevice {
              signingPublicKey
              encryptionPublicKey
              encryptionPublicKeySignature
              createdAt
            }
            commentReplies {
              id
              contentCiphertext
              contentNonce
              keyDerivationTrace {
                workspaceKeyId
                trace {
                  entryId
                  subkeyId
                  context
                  parentId
                }
              }
            }
          }
        }
      }
    }
  `;
  test("bad documentId", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            documentId: null,
            documentShareLink: null,
            deviceSigningPublicKey: null,
            first: 50,
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("bad first", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            documentId: documentId1,
            documentShareLink: null,
            deviceSigningPublicKey: null,
            first: null,
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("bad input", async () => {
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
