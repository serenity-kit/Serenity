import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createWorkspace } from "../../../../test/helpers/workspace/createWorkspace";

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
  const authorizationHeader = `TODO+${username}`;
  const name = "workspace";
  const id = "abc";
  const result = await createWorkspace({
    name,
    id,
    graphql,
    authorizationHeader,
  });
  expect(result.createWorkspace).toMatchInlineSnapshot(`
    Object {
      "workspace": Object {
        "id": "${id}",
        "members": Array [
          Object {
            "isAdmin": true,
            "username": "${username}",
          },
        ],
        "name": "${name}",
      },
    }
  `);
});
