import { gql } from "graphql-request";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { v4 as uuidv4 } from "uuid";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const username2 = "68776484-0e46-4027-a6f4-8bdeef185b73@example.com";
const password = "password";
let didRegisterUser = false;
let mainDeviceSigningPublicKey = "";
let mainDeviceSigningPublicKey2 = "";

beforeAll(async () => {
  await deleteAllRecords();
});

const workspaceId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const otherWorkspaceId = "929ca262-f144-40f7-8fe2-d3147f415f26";
const parentFolderId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const folderId = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const childFolderId = "98b3f4d9-141a-4e11-a0f5-7437a6d1eb4b";
const otherFolderId = "c1c65251-7471-4893-a1b5-e3df937caf66";
const documentId1 = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const documentId2 = "9e911f29-7a86-480b-89d7-5c647f21317f";
const childDocumentId = "929ca262-f144-40f7-8fe2-d3147f415f26";
const otherDocumentId = "c1c65251-7471-4893-a1b5-e3df937caf66";

beforeEach(async () => {
  // TODO: we don't want this before every test
  if (!didRegisterUser) {
    const registerUserResult = await registerUser(graphql, username, password);
    mainDeviceSigningPublicKey = registerUserResult.mainDeviceSigningPublicKey;

    await createInitialWorkspaceStructure({
      workspaceName: "workspace 1",
      workspaceId: workspaceId,
      folderName: "Getting started",
      folderId: uuidv4(),
      folderIdSignature: `TODO+${uuidv4()}`,
      documentName: "Introduction",
      documentId: uuidv4(),
      graphql,
      authorizationHeader: mainDeviceSigningPublicKey,
    });
    const createParentFolderResult = await createFolder({
      graphql,
      id: parentFolderId,
      name: null,
      parentFolderId: null,
      authorizationHeader: mainDeviceSigningPublicKey,
      workspaceId: workspaceId,
    });
    const createFolderResult = await createFolder({
      graphql,
      id: folderId,
      name: null,
      parentFolderId: parentFolderId,
      authorizationHeader: mainDeviceSigningPublicKey,
      workspaceId: workspaceId,
    });
    const createChildFolderResult = await createFolder({
      graphql,
      id: childFolderId,
      name: null,
      parentFolderId: folderId,
      authorizationHeader: mainDeviceSigningPublicKey,
      workspaceId: workspaceId,
    });
    didRegisterUser = true;

    const registerUserResult2 = await registerUser(
      graphql,
      username2,
      password
    );
    mainDeviceSigningPublicKey2 =
      registerUserResult2.mainDeviceSigningPublicKey;

    await createInitialWorkspaceStructure({
      workspaceName: "other user workspace",
      workspaceId: otherWorkspaceId,
      folderName: "Getting started",
      folderId: uuidv4(),
      folderIdSignature: `TODO+${uuidv4()}`,
      documentName: "Introduction",
      documentId: uuidv4(),
      graphql,
      authorizationHeader: mainDeviceSigningPublicKey2,
    });
    const createOtherFolderResult = await createFolder({
      graphql,
      id: otherFolderId,
      name: null,
      parentFolderId: null,
      authorizationHeader: mainDeviceSigningPublicKey2,
      workspaceId: otherWorkspaceId,
    });
  }
});

test("user should be able to list documents in a folder when empty", async () => {
  const authorizationHeader = { authorization: mainDeviceSigningPublicKey };
  // get root folders from graphql
  const query = gql`
    {
        documents(parentFolderId: "${parentFolderId}", first: 50) {
            edges {
                node {
                    id
                    name
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
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.documents).toMatchInlineSnapshot(`
    Object {
      "edges": Array [],
      "pageInfo": Object {
        "endCursor": null,
        "hasNextPage": false,
      },
    }
  `);
});

test("user should be able to list documents in a folder with one item", async () => {
  const authorizationHeader = { authorization: mainDeviceSigningPublicKey };
  await createDocument({
    graphql,
    id: documentId1,
    parentFolderId,
    workspaceId,
    authorizationHeader: authorizationHeader.authorization,
  });
  const query = gql`
    {
        documents(parentFolderId: "${parentFolderId}", first: 50) {
            edges {
                node {
                    id
                    name
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
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.documents).toMatchInlineSnapshot(`
    Object {
      "edges": Array [
        Object {
          "node": Object {
            "id": "3530b9ed-11f3-44c7-9e16-7dba1e14815f",
            "name": "Untitled",
            "parentFolderId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
            "rootFolderId": null,
            "workspaceId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
          },
        },
      ],
      "pageInfo": Object {
        "endCursor": "MzUzMGI5ZWQtMTFmMy00NGM3LTllMTYtN2RiYTFlMTQ4MTVm",
        "hasNextPage": false,
      },
    }
  `);
});

test("user should be able to list documents in a folder with multiple items", async () => {
  const authorizationHeader = { authorization: mainDeviceSigningPublicKey };
  await createDocument({
    graphql,
    id: documentId2,
    parentFolderId,
    workspaceId,
    authorizationHeader: authorizationHeader.authorization,
  });
  const query = gql`
    {
        documents(parentFolderId: "${parentFolderId}", first: 50) {
            edges {
                node {
                    id
                    name
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
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.documents).toMatchInlineSnapshot(`
    Object {
      "edges": Array [
        Object {
          "node": Object {
            "id": "3530b9ed-11f3-44c7-9e16-7dba1e14815f",
            "name": "Untitled",
            "parentFolderId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
            "rootFolderId": null,
            "workspaceId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
          },
        },
        Object {
          "node": Object {
            "id": "9e911f29-7a86-480b-89d7-5c647f21317f",
            "name": "Untitled",
            "parentFolderId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
            "rootFolderId": null,
            "workspaceId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
          },
        },
      ],
      "pageInfo": Object {
        "endCursor": "OWU5MTFmMjktN2E4Ni00ODBiLTg5ZDctNWM2NDdmMjEzMTdm",
        "hasNextPage": false,
      },
    }
  `);
});

test("user should be able to list without showing subfolder documents", async () => {
  const authorizationHeader = { authorization: mainDeviceSigningPublicKey };
  await createDocument({
    graphql,
    id: childDocumentId,
    parentFolderId: folderId,
    workspaceId,
    authorizationHeader: authorizationHeader.authorization,
  });
  const query = gql`
  {
      documents(parentFolderId: "${parentFolderId}", first: 50) {
          edges {
              node {
                  id
                  name
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
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.documents).toMatchInlineSnapshot(`
    Object {
      "edges": Array [
        Object {
          "node": Object {
            "id": "3530b9ed-11f3-44c7-9e16-7dba1e14815f",
            "name": "Untitled",
            "parentFolderId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
            "rootFolderId": null,
            "workspaceId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
          },
        },
        Object {
          "node": Object {
            "id": "9e911f29-7a86-480b-89d7-5c647f21317f",
            "name": "Untitled",
            "parentFolderId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
            "rootFolderId": null,
            "workspaceId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
          },
        },
      ],
      "pageInfo": Object {
        "endCursor": "OWU5MTFmMjktN2E4Ni00ODBiLTg5ZDctNWM2NDdmMjEzMTdm",
        "hasNextPage": false,
      },
    }
  `);
});

test("retrieving a folder that doesn't exist throws an error", async () => {
  const authorizationHeader = { authorization: mainDeviceSigningPublicKey };
  const fakeFolderId = "2bd63f0b-66f4-491c-8808-0a1de192cb67";
  const query = gql`
  {
      documents(parentFolderId: "${fakeFolderId}", first: 50) {
          edges {
              node {
                  id
                  name
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
      await graphql.client.request(query, null, authorizationHeader))()
  ).rejects.toThrow("Folder not found");
});

test("listing documents that the user doesn't own throws an error", async () => {
  const authorizationHeader = { authorization: mainDeviceSigningPublicKey };
  const query = gql`
  {
      documents(parentFolderId: "${otherFolderId}", first: 50) {
          edges {
              node {
                  id
                  name
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
      await graphql.client.request(query, null, authorizationHeader))()
  ).rejects.toThrow("Unauthorized");
});
