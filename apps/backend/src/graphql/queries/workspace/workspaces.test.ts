import { gql } from "graphql-request";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createWorkspace } from "../../../../test/helpers/workspace/createWorkspace";

const graphql = setupGraphql();
let userId = "";
let mainDeviceSigningPublicKey = "";
const username = "user";
const password = "password";
let didRegisterUser = false;

beforeAll(async () => {
  await deleteAllRecords();
});

beforeEach(async () => {
  // TODO: we don't want this before every test
  if (!didRegisterUser) {
    const registerUserResult = await registerUser(graphql, username, password);
    userId = registerUserResult.userId;
    mainDeviceSigningPublicKey = registerUserResult.mainDeviceSigningPublicKey;
    await createWorkspace({
      name: "workspace 1",
      id: "abc",
      graphql,
      authorizationHeader: mainDeviceSigningPublicKey,
    });
    await createWorkspace({
      name: "workspace 2",
      id: "123",
      graphql,
      authorizationHeader: mainDeviceSigningPublicKey,
    });
    didRegisterUser = true;
  }
});

test("user should be able to list workspaces", async () => {
  const authorizationHeader = {
    authorization: mainDeviceSigningPublicKey,
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
    authorization: mainDeviceSigningPublicKey,
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
    authorization: mainDeviceSigningPublicKey,
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
