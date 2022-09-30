import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import setupGraphql, {
  TestContext,
} from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";

const graphql = setupGraphql();
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
  const registerUserResult = await registerUser(graphql, username, password);
  sessionKey = registerUserResult.sessionKey;
  const device = registerUserResult.mainDevice;
  const initialWorkspaceStructureResult = await createInitialWorkspaceStructure(
    {
      workspaceName: "workspace 1",
      workspaceId: workspaceId,
      deviceSigningPublicKey: device.signingPublicKey,
      deviceEncryptionPublicKey: device.encryptionPublicKey,
      deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
      folderName: "Getting started",
      folderId: uuidv4(),
      folderIdSignature: `TODO+${uuidv4()}`,
      documentName: "Introduction",
      documentId: uuidv4(),
      graphql,
      authorizationHeader: sessionKey,
    }
  );
  const workspace =
    initialWorkspaceStructureResult.createInitialWorkspaceStructure.workspace;
  workspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: registerUserResult.mainDevice,
    deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
    workspace,
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
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
    workspaceKeyId: workspace.currentWorkspaceKey.id,
  });
  const createFolderResult = await createFolder({
    graphql,
    id: folderId,
    name: folderName,
    parentFolderId: parentFolderId,
    parentKey: workspaceKey,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
    workspaceKeyId: workspace.currentWorkspaceKey.id,
  });
  const createChildFolderResult = await createFolder({
    graphql,
    id: childFolderId,
    name: childFolderName,
    parentFolderId: folderId,
    parentKey: workspaceKey,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
    workspaceKeyId: workspace.currentWorkspaceKey.id,
  });
  const registerUserResult2 = await registerUser(graphql, username2, password);
  sessionKey2 = registerUserResult2.sessionKey;
  const device2 = registerUserResult2.mainDevice;
  const initialWorkspaceStructureResult2 =
    await createInitialWorkspaceStructure({
      workspaceName: "other user workspace",
      workspaceId: otherWorkspaceId,
      deviceSigningPublicKey: device2.signingPublicKey,
      deviceEncryptionPublicKey: device2.encryptionPublicKey,
      deviceEncryptionPrivateKey: registerUserResult2.encryptionPrivateKey,
      folderName: "Getting started",
      folderId: uuidv4(),
      folderIdSignature: `TODO+${uuidv4()}`,
      documentName: "Introduction",
      documentId: uuidv4(),
      graphql,
      authorizationHeader: sessionKey2,
    });

  const workspace2 =
    initialWorkspaceStructureResult2.createInitialWorkspaceStructure.workspace;
  workspaceKey2 = await getWorkspaceKeyForWorkspaceAndDevice({
    device: registerUserResult2.mainDevice,
    deviceEncryptionPrivateKey: registerUserResult2.encryptionPrivateKey,
    workspace: workspace2,
  });
  const otherFolderName = "other folder";
  const createOtherFolderResult = await createFolder({
    graphql,
    id: otherFolderId,
    name: otherFolderName,
    parentFolderId: null,
    parentKey: workspaceKey2,
    authorizationHeader: sessionKey2,
    workspaceId: otherWorkspaceId,
    workspaceKeyId: workspace2.currentWorkspaceKey.id,
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
    authorizationHeader: sessionKey,
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
  await createDocument({
    graphql,
    id: documentId1,
    parentFolderId,
    workspaceId,
    authorizationHeader: sessionKey,
  });
  const result = await getDocuments({
    graphql,
    authorizationHeader: sessionKey,
    parentFolderId,
    usingOldKeys: false,
  });
  expect(result.documents).toMatchInlineSnapshot(`
    {
      "edges": [
        {
          "node": {
            "id": "3530b9ed-11f3-44c7-9e16-7dba1e14815f",
            "parentFolderId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
            "rootFolderId": null,
            "subkeyId": null,
            "workspaceId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
            "workspaceKeyId": null,
          },
        },
      ],
      "pageInfo": {
        "endCursor": "MzUzMGI5ZWQtMTFmMy00NGM3LTllMTYtN2RiYTFlMTQ4MTVm",
        "hasNextPage": false,
      },
    }
  `);
});

test("user should be able to list documents in a folder with multiple items", async () => {
  await createDocument({
    graphql,
    id: documentId2,
    parentFolderId,
    workspaceId,
    authorizationHeader: sessionKey,
  });
  const result = await getDocuments({
    graphql,
    authorizationHeader: sessionKey,
    parentFolderId,
    usingOldKeys: false,
  });
  expect(result.documents).toMatchInlineSnapshot(`
    {
      "edges": [
        {
          "node": {
            "id": "9e911f29-7a86-480b-89d7-5c647f21317f",
            "parentFolderId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
            "rootFolderId": null,
            "subkeyId": null,
            "workspaceId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
            "workspaceKeyId": null,
          },
        },
        {
          "node": {
            "id": "3530b9ed-11f3-44c7-9e16-7dba1e14815f",
            "parentFolderId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
            "rootFolderId": null,
            "subkeyId": null,
            "workspaceId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
            "workspaceKeyId": null,
          },
        },
      ],
      "pageInfo": {
        "endCursor": "MzUzMGI5ZWQtMTFmMy00NGM3LTllMTYtN2RiYTFlMTQ4MTVm",
        "hasNextPage": false,
      },
    }
  `);
});

test("user should be able to list without showing subfolder documents", async () => {
  await createDocument({
    graphql,
    id: childDocumentId,
    parentFolderId: folderId,
    workspaceId,
    authorizationHeader: sessionKey,
  });
  const result = await getDocuments({
    graphql,
    authorizationHeader: sessionKey,
    parentFolderId,
    usingOldKeys: false,
  });
  expect(result.documents).toMatchInlineSnapshot(`
    {
      "edges": [
        {
          "node": {
            "id": "9e911f29-7a86-480b-89d7-5c647f21317f",
            "parentFolderId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
            "rootFolderId": null,
            "subkeyId": null,
            "workspaceId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
            "workspaceKeyId": null,
          },
        },
        {
          "node": {
            "id": "3530b9ed-11f3-44c7-9e16-7dba1e14815f",
            "parentFolderId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
            "rootFolderId": null,
            "subkeyId": null,
            "workspaceId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
            "workspaceKeyId": null,
          },
        },
      ],
      "pageInfo": {
        "endCursor": "MzUzMGI5ZWQtMTFmMy00NGM3LTllMTYtN2RiYTFlMTQ4MTVm",
        "hasNextPage": false,
      },
    }
  `);
});

test("old workspace keys", async () => {
  const result = await getDocuments({
    graphql,
    authorizationHeader: sessionKey,
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
        authorizationHeader: sessionKey,
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
        authorizationHeader: sessionKey,
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

describe("Input Errors", () => {
  const authorizationHeader = { authorization: sessionKey };
  test("Invalid first", async () => {
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
        await graphql.client.request(query1, null, authorizationHeader))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
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
        await graphql.client.request(query2, null, authorizationHeader))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
