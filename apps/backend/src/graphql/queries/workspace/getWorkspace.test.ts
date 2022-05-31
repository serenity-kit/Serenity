import { userInfo } from "os";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { getWorkspace } from "../../../database/workspace/getWorkspace";

let userId = "";

beforeAll(async () => {
  await deleteAllRecords();
});

test("user should be able to retreive their own workspace by id", async () => {
  const id = "getWorkspace1";
  const username = "jane@example.com";
  const user = await createUserWithWorkspace({ id, username });
  userId = user.id;
  const workspace = await getWorkspace({
    id,
    userId: user.id,
  });
  expect(workspace).toMatchInlineSnapshot(`
    Object {
      "id": "getWorkspace1",
      "idSignature": "TODO",
      "members": Array [
        Object {
          "isAdmin": true,
          "userId": "${userId}",
          "username": "${username}",
        },
      ],
      "name": "My Workspace",
    }
  `);
});

test("user should not be able to retreive someone elses workspace by id", async () => {
  const id = "getWorkspace2";
  const username = "jane2@example.com";
  const user = await createUserWithWorkspace({ id, username });
  await createUserWithWorkspace({
    id: "getWorkspace2Joe",
    username: "joe@example.com",
  });
  const workspace = await getWorkspace({
    id: "getWorkspace2Joe",
    userId: user.id,
  });
  expect(workspace).toBeNull();
});

test("user should receive null in case the workspace doesn't exists", async () => {
  const id = "getWorkspace3";
  const username = "jane3@example.com";
  const user = await createUserWithWorkspace({ id, username });
  const workspace = await getWorkspace({
    id: "getWorkspace3_DOES_NOT_EXIST",
    userId: user.id,
  });
  expect(workspace).toBeNull();
});
