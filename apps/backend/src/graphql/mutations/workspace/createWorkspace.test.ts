import { gql } from "graphql-request";
import sodium from "libsodium-wrappers-sumo";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";

const graphql = setupGraphql();
const username = "user";
const password = "password";

beforeAll(async () => {
  await deleteAllRecords();
});

beforeEach(async () => {
  // TODO: we don't want this before every test
  await registerUser(graphql, username, password);
});

test("user should be able to create a workspace", async () => {
  // generate a challenge code
  const authorizationHeader = {
    authorization: `TODO+${username}`,
  };
  const workspaceName = "workspace";
  const workspaceId = "abc";
  const query = gql`
    mutation {
      createWorkspace(
        input: {
          name: "${workspaceName}"
          id: "${workspaceId}"
        }
      ) {
        workspace {
          id
          name
        }
      }
    }
  `;
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.createWorkspace).toMatchInlineSnapshot(`
    Object {
      "workspace": Object {
        "id": "${workspaceId}",
        "name": "${workspaceName}",
      },
    }
  `);
});
