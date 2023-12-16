import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
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
const password = "password22room5K42";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  documentId1 = userData1.document.id;
  sessionKey = userData1.sessionKey;
  // create two comments
  const comment1Result = await createComment({
    graphql,
    snapshotId: userData1.snapshot.publicData.snapshotId,
    snapshotKey: userData1.snapshotKey.key,
    comment: "comment 1",
    creatorDevice: userData1.webDevice,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    documentId: userData1.document.id,
  });
  comment1 = comment1Result.createComment.comment;
  const comment2Result = await createComment({
    graphql,
    snapshotId: userData1.snapshot.publicData.snapshotId,
    snapshotKey: userData1.snapshotKey.key,
    comment: "comment 2",
    creatorDevice: userData1.webDevice,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    documentId: userData1.document.id,
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
    first: 1,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  const edges = result.commentsByDocumentId.edges;
  expect(edges.length).toBe(1);
  expect(edges[0].node.id).toBe(comment1.id);
  expect(typeof edges[0].node.createdAt).toBe("string");
  const result2 = await commentsByDocumentId({
    graphql,
    documentId: userData1.document.id,
    first: 1,
    after: result.commentsByDocumentId.pageInfo.endCursor,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  const edges2 = result2.commentsByDocumentId.edges;
  expect(edges2.length).toBe(1);
  expect(edges2[0].node.id).toBe(comment2.id);
  expect(typeof edges2[0].node.createdAt).toBe("string");
});

test("all comments", async () => {
  const result = await commentsByDocumentId({
    graphql,
    documentId: userData1.document.id,
    first: 50,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  const edges = result.commentsByDocumentId.edges;
  expect(edges.length).toBe(2);
});

test("bad document share token", async () => {
  await expect(
    (async () =>
      await commentsByDocumentId({
        graphql,
        documentId: userData1.document.id,
        documentShareLinkToken: "badtoken",
        first: 50,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("no access to workspace", async () => {
  const userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  await expect(
    (async () =>
      await commentsByDocumentId({
        graphql,
        documentId: userData1.document.id,
        first: 50,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData2.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("document share token", async () => {
  const userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
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
  const result = await commentsByDocumentId({
    graphql,
    documentId: userData1.document.id,
    documentShareLinkToken,
    first: 50,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
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
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
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
    authorization: deriveSessionAuthorization({ sessionKey }).authorization,
  };

  const query = gql`
    query commentsByDocumentId(
      $documentId: ID!
      $documentShareLinkToken: String
      $first: Int!
      $after: String
    ) {
      commentsByDocumentId(
        documentId: $documentId
        documentShareLinkToken: $documentShareLinkToken
        first: $first
        after: $after
      ) {
        edges {
          node {
            id
            documentId
            contentCiphertext
            contentNonce
            createdAt
            subkeyId
            snapshotId
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
              createdAt
            }
          }
        }
      }
    }
  `;
  test("bad documentId", async () => {
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          {
            documentId: null,
            documentShareLink: null,
            first: 50,
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("bad first", async () => {
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          {
            documentId: documentId1,
            documentShareLink: null,
            first: null,
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("bad input", async () => {
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
