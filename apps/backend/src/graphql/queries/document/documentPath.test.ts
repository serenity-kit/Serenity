import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import setupGraphql, {
  TestContext,
} from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
let userData2: any = undefined;
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const username2 = "68776484-0e46-4027-a6f4-8bdeef185b73@example.com";
const password = "password22room5K42";
let sessionKey = "";
let sessionKey2 = "";
let workspaceKey = "";
let workspaceKey2 = "";

const workspaceId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const otherWorkspaceId = "929ca262-f144-40f7-8fe2-d3147f415f26";
const parentFolderId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const folderId = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const childFolderId = "98b3f4d9-141a-4e11-a0f5-7437a6d1eb4b";
const otherFolderId = "c1c65251-7471-4893-a1b5-e3df937caf66";

let parentDocumentId: string;
let documentId: string;
let otherDocumentId: string;

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspace: userData1.workspace,
  });
  const parentFolderName = "parent folder";
  const folderName = "folder";
  const childFolderName = "child folder";
  const createParentFolderResult = await createFolder({
    graphql,
    id: parentFolderId,
    name: parentFolderName,
    parentFolderId: null,
    parentKey: workspaceKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
  });
  const createFolderResult = await createFolder({
    graphql,
    id: folderId,
    name: folderName,
    parentFolderId: parentFolderId,
    parentKey: workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  const createChildFolderResult = await createFolder({
    graphql,
    id: childFolderId,
    name: childFolderName,
    parentFolderId: null,
    parentKey: workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  const createDocumentResult = await createDocument({
    graphql,
    parentFolderId: parentFolderId,
    workspaceId: userData1.workspace.id,
    activeDevice: userData1.webDevice,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  parentDocumentId = createDocumentResult.createDocument.id;

  const createDocumentResult2 = await createDocument({
    graphql,
    parentFolderId: folderId,
    workspaceId: userData1.workspace.id,
    activeDevice: userData1.webDevice,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  documentId = createDocumentResult2.createDocument.id;

  userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });

  const workspace2 = userData2.workspace;
  workspaceKey2 = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData2.device,
    deviceEncryptionPrivateKey: userData2.encryptionPrivateKey,
    workspace: userData2.workspace,
  });
  const otherFolderName = "other folder";
  const createOtherFolderResult = await createFolder({
    graphql,
    id: otherFolderId,
    name: otherFolderName,
    parentFolderId: null,
    parentKey: workspaceKey2,
    workspaceId: userData2.workspace.id,
    workspaceKeyId: userData2.workspace.currentWorkspaceKey.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
  });
  const createDocumentResult3 = await createDocument({
    graphql,
    parentFolderId: otherFolderId,
    workspaceId: userData2.workspace.id,
    activeDevice: userData2.webDevice,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
  });
  otherDocumentId = createDocumentResult3.createDocument.id;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

type Props = {
  graphql: TestContext;
  documentId: string;
  authorizationHeader: string;
};
export const getDocumentPath = async ({
  graphql,
  documentId,
  authorizationHeader,
}: Props) => {
  const query = gql`
    query documentPath($id: ID!) {
      documentPath(id: $id) {
        id
        parentFolderId
        rootFolderId
        workspaceId
        nameCiphertext
        nameNonce
        keyDerivationTrace {
          workspaceKeyId
          trace {
            entryId
            subkeyId
            parentId
            context
          }
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { id: documentId },
    { authorization: authorizationHeader }
  );
  return result;
};

test("user should be able to get a document path", async () => {
  const result = await getDocumentPath({
    graphql,
    documentId: parentDocumentId,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  const documentPath = result.documentPath;
  expect(documentPath.length).toBe(1);
  for (const documentPathItem of documentPath) {
    expect(documentPathItem.id).toBe(parentFolderId);
    expect(documentPathItem.parentFolderId).toBe(null);
    expect(documentPathItem.rootFolderId).toBe(null);
    expect(documentPathItem.workspaceId).toBe(userData1.workspace.id);
    expect(typeof documentPathItem.nameCiphertext).toBe("string");
    expect(typeof documentPathItem.nameNonce).toBe("string");
  }
});

test("user should be able to get a document path for a deep tree", async () => {
  const result = await getDocumentPath({
    graphql,
    documentId: documentId,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  const documentPath = result.documentPath;
  expect(documentPath.length).toBe(2);
  for (const documentPathItem of documentPath) {
    expect(typeof documentPathItem.nameCiphertext).toBe("string");
    expect(typeof documentPathItem.nameNonce).toBe("string");
    expect(documentPathItem.workspaceId).toBe(userData1.workspace.id);
    if (documentPathItem.id === parentFolderId) {
      expect(documentPathItem.id).toBe(parentFolderId);
      expect(documentPathItem.rootFolderId).toBe(null);
    } else if (documentPathItem.id === folderId) {
      expect(documentPathItem.id).toBe(folderId);
      expect(documentPathItem.rootFolderId).toBe(parentFolderId);
    } else {
      throw new Error("unexpected document path item");
    }
  }
});

test("user should not be able to retrieve another user's folder", async () => {
  await expect(
    (async () =>
      await getDocumentPath({
        graphql,
        documentId: otherDocumentId,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("retrieving a document that doesn't exist should throw an error", async () => {
  await expect(
    (async () =>
      await getDocumentPath({
        graphql,
        documentId: generateId(),
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrow(/FORBIDDEN/);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getDocumentPath({
        graphql,
        documentId: otherDocumentId,
        authorizationHeader: "bad-session-key",
      }))()
  ).rejects.toThrow(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeader = {
    authorization: deriveSessionAuthorization({ sessionKey }).authorization,
  };
  const query = gql`
    query documentPath($id: ID!) {
      documentPath(id: $id) {
        id
        parentFolderId
        rootFolderId
        workspaceId
      }
    }
  `;
  test("Invalid id", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          { id: null },
          authorizationHeader
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeader))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
