import { gql } from "graphql-request";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createWorkspace } from "../../../../test/helpers/workspace/createWorkspace";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const password = "password";
let didRegisterUser = false;

beforeAll(async () => {
  await deleteAllRecords();
});

const workspace1Id = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const workspace2Id = "a0856379-ad08-4dc5-baf5-ab93c9f7b5e5";

beforeEach(async () => {
  // TODO: we don't want this before every test
  if (!didRegisterUser) {
    await registerUser(
      graphql,
      username,
      password,
      "17e17242-d86e-476b-af21-5dcfafa332cb"
    );
    await createWorkspace({
      name: "workspace 1",
      id: workspace1Id,
      graphql,
      authorizationHeader: `TODO+${username}`,
    });
    await createWorkspace({
      name: "workspace 2",
      id: workspace2Id,
      graphql,
      authorizationHeader: `TODO+${username}`,
    });
    didRegisterUser = true;
  }
});

test("user should be able to get a workspace by id", async () => {
  const authorizationHeader = { authorization: `TODO+${username}` };
  const query = gql`
    query workspace($id: ID) {
      workspace(id: $id) {
        id
        name
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { id: workspace2Id },
    authorizationHeader
  );
  expect(result.workspace).toMatchInlineSnapshot(`
    Object {
      "id": "a0856379-ad08-4dc5-baf5-ab93c9f7b5e5",
      "name": "workspace 2",
    }
  `);
});

test("user should get a workspace without providing an id", async () => {
  const authorizationHeader = { authorization: `TODO+${username}` };
  const query = gql`
    query workspace {
      workspace {
        id
        name
      }
    }
  `;
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.workspace).toMatchInlineSnapshot(`
    Object {
      "id": "17e17242-d86e-476b-af21-5dcfafa332cb",
      "name": "My Workspace",
    }
  `);
});
