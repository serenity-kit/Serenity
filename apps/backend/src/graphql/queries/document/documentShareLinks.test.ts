import {
  createSnapshotKey,
  deriveKeysFromKeyDerivationTrace,
  deriveSessionAuthorization,
  generateId,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocumentShareLink } from "../../../../test/helpers/document/createDocumentShareLink";
import { getDocumentShareLinks } from "../../../../test/helpers/document/getDocumentShareLinks";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { getWorkspace } from "../../../../test/helpers/workspace/getWorkspace";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password22room5K42";
let userData1: any = null;
let user1Workspace: any = null;

const setup = async () => {
  await sodium.ready;
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  const getWorkspaceResult = await getWorkspace({
    graphql,
    workspaceId: userData1.workspace.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
  });
  user1Workspace = getWorkspaceResult.workspace;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("list share link", async () => {
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    userData1.webDevice;
  const folderKeyTrace = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: userData1.folder.keyDerivationTrace,
    activeDevice: userData1.webDevice,
    workspaceKeyBox: user1Workspace.currentWorkspaceKey.workspaceKeyBox,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: user1Workspace.currentWorkspaceKey.id,
  });
  const snapshotKeyData = createSnapshotKey({
    folderKey: folderKeyTrace.trace[folderKeyTrace.trace.length - 1].key,
  });
  const { createDocumentShareLinkQueryResult } = await createDocumentShareLink({
    graphql,
    documentId: userData1.document.id,
    sharingRole: Role.EDITOR,
    mainDevice: userData1.mainDevice,
    snapshotKey: snapshotKeyData.key,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  const token =
    createDocumentShareLinkQueryResult.createDocumentShareLink.token;

  const documentShareLinks = await getDocumentShareLinks({
    documentId: userData1.document.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    graphql,
  });

  expect(documentShareLinks.documentShareLinks.nodes[0].token).toEqual(token);
});

test("User has no access to the workspace", async () => {
  const otherUser = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });

  await expect(
    (async () =>
      await getDocumentShareLinks({
        documentId: userData1.document.id,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: otherUser.sessionKey,
        }).authorization,
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
