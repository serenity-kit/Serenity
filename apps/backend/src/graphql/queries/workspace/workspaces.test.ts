import { gql } from "graphql-request";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { v4 as uuidv4 } from "uuid";

const graphql = setupGraphql();
let userId = "";
let sessionKey = "";
const username = "user";
const password = "password";

const setup = async () => {
  const registerUserResult = await registerUser(graphql, username, password);
  userId = registerUserResult.userId;
  sessionKey = registerUserResult.sessionKey;
  await createInitialWorkspaceStructure({
    workspaceName: "workspace 1",
    workspaceId: "abc",
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    folderName: "Getting started",
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey,
  });
  await createInitialWorkspaceStructure({
    workspaceName: "workspace 2",
    workspaceId: "123",
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    folderName: "Getting started",
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to list workspaces", async () => {
  const authorizationHeader = {
    authorization: sessionKey,
  };
  const query = gql`
    {
      workspaces(first: 50) {
        nodes {
          id
          name
          members {
            userId
            isAdmin
          }
        }
        edges {
          cursor
        }
      }
    }
  `;
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.workspaces).toMatchInlineSnapshot(`
    Object {
      "edges": Array [
        Object {
          "cursor": "YWJj",
        },
        Object {
          "cursor": "MTIz",
        },
      ],
      "nodes": Array [
        Object {
          "id": "abc",
          "members": Array [
            Object {
              "isAdmin": true,
              "userId": "${userId}",
            },
          ],
          "name": "workspace 1",
        },
        Object {
          "id": "123",
          "members": Array [
            Object {
              "isAdmin": true,
              "userId": "${userId}",
            },
          ],
          "name": "workspace 2",
        },
      ],
    }
  `);
});

test("user cannot query more than 50 results", async () => {
  const authorizationHeader = {
    authorization: sessionKey,
  };
  const query = gql`
    {
      workspaces(first: 51) {
        nodes {
          id
          name
        }
      }
    }
  `;
  await expect(async () => {
    await graphql.client.request(query, null, authorizationHeader);
  }).rejects.toThrowError(
    "Requested too many workspaces. First value exceeds 50."
  );
});

test("user cannot query by paginating cursor", async () => {
  const authorizationHeader = {
    authorization: sessionKey,
  };
  const query = gql`
    {
      workspaces(first: 1, after: "YWJj") {
        nodes {
          id
          name
        }
      }
    }
  `;
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.workspaces).toMatchInlineSnapshot(`
    Object {
      "nodes": Array [
        Object {
          "id": "123",
          "name": "workspace 2",
        },
      ],
    }
  `);
});
