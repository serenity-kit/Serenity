import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { commentsByDocumentId } from "../../../../test/helpers/comment/commentsByDocumentId";
import { createComment } from "../../../../test/helpers/comment/createComment";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
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
  // create two comment
  await createComment({
    graphql,
    documentId: userData1.document.id,
    comment: "comment 1",
    creatorDevice: userData1.webDevice,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    authorizationHeader: userData1.sessionKey,
  });
  await createComment({
    graphql,
    documentId: userData1.document.id,
    comment: "comment 2",
    creatorDevice: userData1.webDevice,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    authorizationHeader: userData1.sessionKey,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("all comments", async () => {
  const result = await commentsByDocumentId({
    graphql,
    documentId: userData1.document.id,
    first: 50,
    authorizationHeader: userData1.sessionKey,
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

test("Input Errors", async () => {
  const authorizationHeaders = {
    authorization: sessionKey,
  };

  const query = gql`
    {
      commentsByDocumentId(documentId: null, first: 501) {
        edges {
          node {
            id
            documentId
            encryptedContent
            encryptedContentNonce
            creatorDevice {
              signingPublicKey
              encryptionPublicKey
              encryptionPublicKeySignature
              createdAt
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
  await expect(
    (async () =>
      await graphql.client.request(query, null, authorizationHeaders))()
  ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
});
