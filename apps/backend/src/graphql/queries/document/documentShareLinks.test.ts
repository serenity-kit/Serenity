import sodium from "@serenity-tools/libsodium";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocumentShareLink } from "../../../../test/helpers/document/createDocumentShareLink";
import { getDocumentShareLinks } from "../../../../test/helpers/document/getDocumentShareLinks";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password";
let userData1: any = null;

const setup = async () => {
  await sodium.ready;
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("list share link", async () => {
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    userData1.webDevice;
  // TODO: derive snapshotkey from folder key derivation trace
  const snapshotKey = await sodium.crypto_kdf_keygen();
  const documentShareLinkResponse = await createDocumentShareLink({
    graphql,
    documentId: userData1.document.id,
    sharingRole: Role.EDITOR,
    creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
    creatorDevice,
    snapshotKey,
    authorizationHeader: userData1.sessionKey,
  });
  const token = documentShareLinkResponse.createDocumentShareLink.token;

  const documentShareLinks = await getDocumentShareLinks({
    documentId: userData1.document.id,
    authorizationHeader: userData1.sessionKey,
    graphql,
  });

  expect(documentShareLinks.documentShareLinks.nodes[0].token).toEqual(token);
});

test("User has no access to the workspace", async () => {
  const otherUser = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });

  await expect(
    (async () =>
      await getDocumentShareLinks({
        documentId: userData1.document.id,
        authorizationHeader: otherUser.sessionKey,
        graphql,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getDocumentShareLinks({
        documentId: userData1.document.id,
        authorizationHeader: "badauthheader",
        graphql,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const query = gql`
    query documentShareLinks($documentId: ID!, $first: Int! = 50) {
      documentShareLinks(documentId: $documentId, first: $first) {
        nodes {
          token
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  `;

  test("Invalid documentId", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            documentId: null,
          },
          { authorization: userData1.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });

  test("Invalid first", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            documentId: userData1.document.id,
            first: 51,
          },
          { authorization: userData1.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });

  test("No Input", async () => {
    await expect(
      (async () =>
        await graphql.client.request(query, null, {
          authorization: userData1.sessionKey,
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
