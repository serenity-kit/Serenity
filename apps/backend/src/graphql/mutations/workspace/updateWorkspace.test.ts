import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createWorkspace } from "../../../../test/helpers/workspace/createWorkspace";
import { updateWorkspace } from "../../../../test/helpers/workspace/updateWorkspace";

const graphql = setupGraphql();
const username = "user";
const username2 = "user1";
const password = "password";
let isUserRegistered = false;
let addedWorkspace: any = null;

beforeAll(async () => {
  await deleteAllRecords();
});

beforeEach(async () => {
  // TODO: we don't want this before every test
  if (!isUserRegistered) {
    await registerUser(graphql, username, password);
    await registerUser(graphql, username2, password);
    const createWorkspaceResult = await createWorkspace({
      name: "workspace 1",
      id: "abc",
      graphql,
      authorizationHeader: `TODO+${username}`,
    });
    addedWorkspace = createWorkspaceResult.createWorkspace.workspace;
    isUserRegistered = true;
  }
});

test("user should be able to update a workspace", async () => {
  // generate a challenge code
  const authorizationHeader = `TODO+${username}`;
  const id = "abc";
  const name = "renamed workspace";
  const permissions = [
    {
      username: "user",
      isAdmin: false,
    },
    {
      username: "user1",
      isAdmin: true,
    },
  ];
  const result = await updateWorkspace({
    graphql,
    id,
    name,
    permissions,
    authorizationHeader,
  });
  expect(result.updateWorkspace).toMatchInlineSnapshot(`
    Object {
      "workspace": Object {
        "id": "abc",
        "name": "renamed workspace",
        "permissions": Array [
          Object {
            "isAdmin": "false",
            "username": "user",
          },
          Object {
            "isAdmin": "true",
            "username": "user1",
          },
        ],
      },
    }
  `);
});

test("user should not be able to update a workspace they don't own", async () => {
  // generate a challenge code
  const authorizationHeader = `TODO+${username}`;
  const id = "abc";
  const name = "unauthorized workspace";
  const permissions = [
    {
      username: "user",
      isAdmin: false,
    },
    {
      username: "user1",
      isAdmin: true,
    },
  ];
  await expect(
    (async () =>
      await updateWorkspace({
        graphql,
        id,
        name,
        permissions,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Invalid workspace ID");
});

test("user should not be able to update a workspace for a workspace that doesn't exist", async () => {
  // generate a challenge code
  const authorizationHeader = `TODO+${username}`;
  const id = "hahahaha";
  const name = "nonexistent workspace";
  const permissions = [
    {
      username: "user",
      isAdmin: false,
    },
    {
      username: "user1",
      isAdmin: true,
    },
  ];
  await expect(
    (async () =>
      await updateWorkspace({
        graphql,
        id,
        name,
        permissions,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Invalid workspace ID");
});
