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
const password = "password";
let user1Data: any = undefined;
let user2Data: any = undefined;
let user1WorkspaceKey = "";
let user2WorkspaceKey = "";

const parentFolderId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const folderId = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const childFolderId = "98b3f4d9-141a-4e11-a0f5-7437a6d1eb4b";
const otherFolderId = "c1c65251-7471-4893-a1b5-e3df937caf66";
const documentId1 = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const documentId2 = "9e911f29-7a86-480b-89d7-5c647f21317f";
const childDocumentId = "929ca262-f144-40f7-8fe2-d3147f415f26";

type GetDocumentsProps = {
  graphql: TestContext;
  authorizationHeader: string;
  parentFolderId: string;
  usingOldKeys: boolean;
};
const getDocuments = async ({
  authorizationHeader,
  parentFolderId,
  usingOldKeys,
}: GetDocumentsProps) => {
  const authorizationHeaders = { authorization: authorizationHeader };
  // get root folders from graphql
  const query = gql`
    {
        documents(parentFolderId: "${parentFolderId}", first: 50, usingOldKeys: ${usingOldKeys}) {
            edges {
                node {
                    id
                    parentFolderId
                    rootFolderId
                    workspaceKeyId
                    subkeyId
                    contentSubkeyId
                    workspaceId
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
    `;
  const result = await graphql.client.request(
    query,
    null,
    authorizationHeaders
  );
  return result;
};

const setup = async () => {
  user1Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  user1WorkspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: user1Data.device,
    deviceEncryptionPrivateKey: user1Data.encryptionPrivateKey,
    workspace: user1Data.workspace,
  });

  const parentFolderName = "parent folder";
  const folderName = "folder";
  const childFolderName = "child folder";
  const createParentFolderResult = await createFolder({
    graphql,
    id: parentFolderId,
    name: parentFolderName,
    parentFolderId: null,
    parentKey: user1WorkspaceKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });
  const createFolderResult = await createFolder({
    graphql,
    id: folderId,
    name: folderName,
    parentFolderId: parentFolderId,
    parentKey: user1WorkspaceKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });
  const createChildFolderResult = await createFolder({
    graphql,
    id: childFolderId,
    name: childFolderName,
    parentFolderId: folderId,
    parentKey: user1WorkspaceKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });

  user2Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  user2WorkspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: user1Data.device,
    deviceEncryptionPrivateKey: user1Data.encryptionPrivateKey,
    workspace: user1Data.workspace,
  });

  const createOtherFolderResult = await createFolder({
    graphql,
    id: otherFolderId,
    name: "other folder",
    parentFolderId: null,
    parentKey: user2WorkspaceKey,
    workspaceId: user2Data.workspace.id,
    workspaceKeyId: user2Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user2Data.sessionKey,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});
test("user should be able to list documents in a folder when empty", async () => {
  // get root folders from graphql
  const result = await getDocuments({
    graphql,
    parentFolderId,
    usingOldKeys: false,
    authorizationHeader: user1Data.sessionKey,
  });
  expect(result.documents).toMatchInlineSnapshot(`
    {
      "edges": [],
      "pageInfo": {
        "endCursor": null,
        "hasNextPage": false,
      },
    }
  `);
});

test("user should be able to list documents in a folder with one item", async () => {
  const id = uuidv4();
  await createDocument({
    graphql,
    id,
    parentFolderId,
    workspaceId: user1Data.workspace.id,
    contentSubkeyId: 1,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });
  const result = await getDocuments({
    graphql,
    parentFolderId,
    usingOldKeys: false,
    authorizationHeader: user1Data.sessionKey,
  });
  const documents = result.documents.edges;
  expect(documents.length).toBe(1);
  const document = documents[0].node;
  expect(document.id).toBe(id);
  expect(document.parentFolderId).toBe(parentFolderId);
  expect(document.rootFolderId).toBe(null);
  expect(document.contentSubkeyId).toBe(1);
  expect(document.workspaceId).toBe(user1Data.workspace.id);
});

test("user should be able to list documents in a folder with multiple items", async () => {
  const id = uuidv4();
  await createDocument({
    graphql,
    id,
    parentFolderId,
    workspaceId: user1Data.workspace.id,
    contentSubkeyId: 2,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });
  const result = await getDocuments({
    graphql,
    parentFolderId,
    usingOldKeys: false,
    authorizationHeader: user1Data.sessionKey,
  });
  const documents = result.documents.edges;
  expect(documents.length).toBe(2);
  for (let documentNode of documents) {
    const document = documentNode.node;
    if (document.id === id) {
      expect(document.contentSubkeyId).toBe(2);
    } else {
      expect(document.contentSubkeyId).toBe(1);
    }
    expect(document.parentFolderId).toBe(parentFolderId);
    expect(document.workspaceId).toBe(user1Data.workspace.id);
  }
});

test("user should be able to list without showing subfolder documents", async () => {
  await createDocument({
    graphql,
    id: childDocumentId,
    parentFolderId: folderId,
    workspaceId: user1Data.workspace.id,
    contentSubkeyId: 3,
    authorizationHeader: user1Data.sessionKey,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
  });
  const result = await getDocuments({
    graphql,
    parentFolderId,
    usingOldKeys: false,
    authorizationHeader: user1Data.sessionKey,
  });
  const documents = result.documents.edges;
  expect(documents.length).toBe(2);
});

test("old workspace keys", async () => {
  const result = await getDocuments({
    graphql,
    parentFolderId,
    usingOldKeys: true,
    authorizationHeader: user1Data.sessionKey,
  });
  expect(result.documents).toMatchInlineSnapshot(`
    {
      "edges": [],
      "pageInfo": {
        "endCursor": null,
        "hasNextPage": false,
      },
    }
  `);
});

test("retrieving a folder that doesn't exist throws an error", async () => {
  const fakeFolderId = "2bd63f0b-66f4-491c-8808-0a1de192cb67";
  await expect(
    (async () =>
      await getDocuments({
        graphql,
        parentFolderId: fakeFolderId,
        usingOldKeys: false,
        authorizationHeader: user1Data.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("listing documents that the user doesn't own throws an error", async () => {
  await expect(
    (async () =>
      await getDocuments({
        graphql,
        parentFolderId: otherFolderId,
        usingOldKeys: false,
        authorizationHeader: user1Data.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getDocuments({
        graphql,
        authorizationHeader: "badauthheader",
        parentFolderId: otherFolderId,
        usingOldKeys: false,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input Errors", () => {
  test("Invalid first", async () => {
    const user2Data = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });

    const query1 = gql`
    {
        documents(parentFolderId: "${otherFolderId}", first: 51) {
            edges {
                node {
                    id
                    parentFolderId
                    rootFolderId
                    workspaceKeyId
                    subkeyId
                    contentSubkeyId
                    workspaceId
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
        await graphql.client.request(query1, null, {
          authorizationHeader: user2Data.sessionKey,
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    const user2Data = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    const query2 = gql`
      {
        documents(parentFolderId: "", first: 50) {
          edges {
            node {
              id
              parentFolderId
              rootFolderId
              workspaceKeyId
              subkeyId
              contentSubkeyId
              workspaceId
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
        await graphql.client.request(query2, null, {
          authorizationHeader: user2Data.sessionKey,
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
