import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
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
const password = "password";
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

const parentDocumentId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const documentId = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const otherDocumentId = "929ca262-f144-40f7-8fe2-d3147f415f26";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });

  // const registerUserResult = await registerUser(graphql, username, password);
  // sessionKey = registerUserResult.sessionKey;
  // const device = registerUserResult.mainDevice;
  // const initialWorkspaceStructureResult = await createInitialWorkspaceStructure(
  //   {
  //     workspaceName: "workspace 1",
  //     workspaceId: workspaceId,
  //     deviceSigningPublicKey: device.signingPublicKey,
  //     deviceEncryptionPublicKey: device.encryptionPublicKey,
  //     deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
  //     webDevice: registerUserResult.webDevice,
  //     folderId: uuidv4(),
  //     folderIdSignature: `TODO+${uuidv4()}`,
  //     folderName: "Getting started",
  //     documentName: "Introduction",
  //     documentId: uuidv4(),
  //     graphql,
  //     authorizationHeader: sessionKey,
  //   }
  // );
  // const workspace =
  //   initialWorkspaceStructureResult.createInitialWorkspaceStructure.workspace;
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
    authorizationHeader: userData1.sessionKey,
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
    authorizationHeader: userData1.sessionKey,
  });
  const createChildFolderResult = await createFolder({
    graphql,
    id: childFolderId,
    name: childFolderName,
    parentFolderId: null,
    parentKey: workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    authorizationHeader: userData1.sessionKey,
  });
  await createDocument({
    graphql,
    id: parentDocumentId,
    parentFolderId: parentFolderId,
    workspaceId: userData1.workspace.id,
    contentSubkeyId: 1,
    authorizationHeader: userData1.sessionKey,
  });
  await createDocument({
    graphql,
    id: documentId,
    parentFolderId: folderId,
    workspaceId: userData1.workspace.id,
    contentSubkeyId: 2,
    authorizationHeader: userData1.sessionKey,
  });

  userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });

  // const registerUserResult2 = await registerUser(graphql, username2, password);
  // sessionKey2 = registerUserResult2.sessionKey;
  // const device2 = registerUserResult2.mainDevice;
  // const initialWorkspaceStructureResult2 =
  //   await createInitialWorkspaceStructure({
  //     workspaceName: "other user workspace",
  //     workspaceId: otherWorkspaceId,
  //     deviceSigningPublicKey: device2.signingPublicKey,
  //     deviceEncryptionPublicKey: device2.encryptionPublicKey,
  //     deviceEncryptionPrivateKey: registerUserResult2.encryptionPrivateKey,
  //     webDevice: registerUserResult2.webDevice,
  //     folderId: uuidv4(),
  //     folderIdSignature: `TODO+${uuidv4()}`,
  //     folderName: "Getting started",
  //     documentName: "Introduction",
  //     documentId: uuidv4(),
  //     graphql,
  //     authorizationHeader: sessionKey2,
  //   });

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
    authorizationHeader: userData2.sessionKey,
  });
  await createDocument({
    graphql,
    id: otherDocumentId,
    parentFolderId: otherFolderId,
    workspaceId: userData2.workspace.id,
    contentSubkeyId: 3,
    authorizationHeader: userData2.sessionKey,
  });
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
        encryptedName
        encryptedNameNonce
        keyDerivationTrace {
          workspaceKeyId
          parentFolders {
            folderId
            subkeyId
            parentFolderId
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
    authorizationHeader: userData1.sessionKey,
  });
  const documentPath = result.documentPath;
  expect(documentPath.length).toBe(1);
  for (const documentPathItem of documentPath) {
    expect(documentPathItem.id).toBe(parentFolderId);
    expect(documentPathItem.parentFolderId).toBe(null);
    expect(documentPathItem.rootFolderId).toBe(null);
    expect(documentPathItem.workspaceId).toBe(userData1.workspace.id);
    expect(typeof documentPathItem.encryptedName).toBe("string");
    expect(typeof documentPathItem.encryptedNameNonce).toBe("string");
  }
});

test("user should be able to get a document path for a deep tree", async () => {
  const result = await getDocumentPath({
    graphql,
    documentId: documentId,
    authorizationHeader: userData1.sessionKey,
  });
  const documentPath = result.documentPath;
  expect(documentPath.length).toBe(2);
  for (const documentPathItem of documentPath) {
    expect(typeof documentPathItem.encryptedName).toBe("string");
    expect(typeof documentPathItem.encryptedNameNonce).toBe("string");
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
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("retrieving a document that doesn't exist should throw an error", async () => {
  await expect(
    (async () =>
      await getDocumentPath({
        graphql,
        documentId: uuidv4(),
        authorizationHeader: userData1.sessionKey,
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
  const authorizationHeader = { authorization: sessionKey };
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
