import deleteAllRecords from "../../../test/helpers/deleteAllRecords";
import createUserWithWorkspace from "../testHelpers/createUserWithWorkspace";
import { getWorkspace } from "./getWorkspace";

beforeAll(async () => {
  await deleteAllRecords();
});

test("user should be able to retreive their own workspace by id", async () => {
  const id = "getWorkspace1";
  const username = "jane@example.com";
  await createUserWithWorkspace({ id, username });
  const workspace = await getWorkspace({
    id,
    username,
  });
  expect(workspace).toMatchInlineSnapshot(`
    Object {
      "id": "getWorkspace1",
      "idSignature": "TODO",
      "name": "My Workspace",
      "usersToWorkspaces": Array [
        Object {
          "isAdmin": true,
          "username": "jane@example.com",
          "workspaceId": "getWorkspace1",
        },
      ],
    }
  `);
});

test("user should not be able to retreive someone elses workspace by id", async () => {
  const id = "getWorkspace2";
  const username = "jane2@example.com";
  await createUserWithWorkspace({ id, username });
  await createUserWithWorkspace({
    id: "getWorkspace2Joe",
    username: "joe@example.com",
  });
  const workspace = await getWorkspace({
    id: "getWorkspace2Joe",
    username,
  });
  expect(workspace).toBeNull();
});

test("user should receive null in case the workspace doesn't exists", async () => {
  const id = "getWorkspace3";
  const username = "jane3@example.com";
  await createUserWithWorkspace({ id, username });
  const workspace = await getWorkspace({
    id: "getWorkspace3_DOES_NOT_EXIST",
    username,
  });
  expect(workspace).toBeNull();
});
