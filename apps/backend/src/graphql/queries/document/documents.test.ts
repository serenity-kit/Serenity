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
const password = "password22room5K42";
let sessionKey = "";

let workspaceKey = "";
let workspaceKey2 = "";

const workspaceId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const parentFolderId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const folderId = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const childFolderId = "98b3f4d9-141a-4e11-a0f5-7437a6d1eb4b";
const otherFolderId = "c1c65251-7471-4893-a1b5-e3df937caf66";
let documentId1: string;
let documentId2: string;
let childDocumentId: string;

type GetDocumentsProps = {
  graphql: TestContext;
  authorizationHeader: string;
  parentFolderId: string;
  usingOldKeys: boolean;
  first?: number;
};
const getDocuments = async ({
  authorizationHeader,
  parentFolderId,
  usingOldKeys,
  first,
}: GetDocumentsProps) => {
  let firstValue = 50;
  if (first) {
    firstValue = first;
  }
  const authorizationHeaders = { authorization: authorizationHeader };
  // get root folders from graphql
  const query = gql`
    query documents(
      $parentFolderId: ID!
      $usingOldKeys: Boolean!
      $first: Int!
    ) {
      documents(
        parentFolderId: $parentFolderId
        usingOldKeys: $usingOldKeys
        first: $first
      ) {
        edges {
          node {
            id
            parentFolderId
            rootFolderId
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
  const result = await graphql.client.request<any>(
    query,
    {
      parentFolderId,
      usingOldKeys,
      first: firstValue,
    },
    authorizationHeaders
  );
  return result;
};

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
    userId: userData1.user.id,
    device: userData1.webDevice,
  });
  const createFolderResult = await createFolder({
    graphql,
    id: folderId,
    name: folderName,
    parentFolderId: parentFolderId,
    parentKey: workspaceKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    userId: userData1.user.id,
    device: userData1.webDevice,
  });
  const createChildFolderResult = await createFolder({
    graphql,
    id: childFolderId,
    name: childFolderName,
    parentFolderId: folderId,
    parentKey: workspaceKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    userId: userData1.user.id,
    device: userData1.webDevice,
  });

  userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });

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
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
    workspaceId: userData2.workspace.id,
    workspaceKeyId: userData2.workspace.currentWorkspaceKey.id,
    userId: userData2.user.id,
    device: userData2.webDevice,
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
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    parentFolderId,
    usingOldKeys: false,
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
  const createDocumentResult = await createDocument({
    graphql,
    parentFolderId,
    workspaceId: userData1.workspace.id,
    activeDevice: userData1.webDevice,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  documentId1 = createDocumentResult.createDocument.id;

  const result = await getDocuments({
    graphql,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    parentFolderId,
    usingOldKeys: false,
  });
  expect(result.documents.edges).toMatchInlineSnapshot(`
    [
      {
        "node": {
          "id": "${documentId1}",
          "parentFolderId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
          "rootFolderId": null,
          "workspaceId": "${userData1.workspace.id}",
        },
      },
    ]
  `);
});

test("user should be able to list documents in a folder with multiple items", async () => {
  const createDocumentResult = await createDocument({
    graphql,
    parentFolderId,
    workspaceId: userData1.workspace.id,
    activeDevice: userData1.webDevice,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  documentId2 = createDocumentResult.createDocument.id;

  const result = await getDocuments({
    graphql,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    parentFolderId,
    usingOldKeys: false,
  });
  expect(result.documents.edges).toMatchInlineSnapshot(`
    [
      {
        "node": {
          "id": "${documentId2}",
          "parentFolderId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
          "rootFolderId": null,
          "workspaceId": "${userData1.workspace.id}",
        },
      },
      {
        "node": {
          "id": "${documentId1}",
          "parentFolderId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
          "rootFolderId": null,
          "workspaceId": "${userData1.workspace.id}",
        },
      },
    ]
  `);
});

test("user should be able to list without showing subfolder documents", async () => {
  const createDocumentResult = await createDocument({
    graphql,
    parentFolderId: folderId,
    workspaceId: userData1.workspace.id,
    activeDevice: userData1.webDevice,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  childDocumentId = createDocumentResult.createDocument.id;

  const result = await getDocuments({
    graphql,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    parentFolderId,
    usingOldKeys: false,
  });
  expect(result.documents.edges).toMatchInlineSnapshot(`
    [
      {
        "node": {
          "id": "${documentId2}",
          "parentFolderId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
          "rootFolderId": null,
          "workspaceId": "${userData1.workspace.id}",
        },
      },
      {
        "node": {
          "id": "${documentId1}",
          "parentFolderId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
          "rootFolderId": null,
          "workspaceId": "${userData1.workspace.id}",
        },
      },
    ]
  `);
});

test("old workspace keys", async () => {
  const result = await getDocuments({
    graphql,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    parentFolderId,
    usingOldKeys: true,
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
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
        parentFolderId: fakeFolderId,
        usingOldKeys: false,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("listing documents that the user doesn't own throws an error", async () => {
  await expect(
    (async () =>
      await getDocuments({
        graphql,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
        parentFolderId: otherFolderId,
        usingOldKeys: false,
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

test("Query too many", async () => {
  await expect(
    (async () =>
      await getDocuments({
        graphql,
        authorizationHeader: "badauthheader",
        parentFolderId: otherFolderId,
        usingOldKeys: false,
        first: 51,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

describe("Input Errors", () => {
  const authorizationHeader = {
    authorization: deriveSessionAuthorization({ sessionKey }).authorization,
  };
  test("Invalid input", async () => {
    const query2 = gql`
      {
        documents(parentFolderId: "", first: 50) {
          edges {
            node {
              id
              parentFolderId
              rootFolderId
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
        await graphql.client.request<any>(
          query2,
          undefined,
          authorizationHeader
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
