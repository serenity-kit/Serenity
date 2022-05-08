import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createWorkspace } from "../../../../test/helpers/workspace/createWorkspace";
import { deleteWorkspaces } from "../../../../test/helpers/workspace/deleteWorkspaces";

const graphql = setupGraphql();
const username = "user1";
const password = "password";
let isUserRegistered = false;
let addedWorkspace: any = null;

beforeAll(async () => {
  await deleteAllRecords();
});

beforeEach(async () => {
  // TODO: we don't want this before every test
  if (!isUserRegistered) {
    await registerUser(
      graphql,
      username,
      password,
      "9c22b47e-3d5e-4aae-a0b2-7e6f8974e7e2"
    );
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

test.only("user should be able to delete a workspace", async () => {
  // generate a challenge code
  const authorizationHeader = `TODO+${username}`;
  const ids = [addedWorkspace.id];
  const result = await deleteWorkspaces({ graphql, ids, authorizationHeader });
  expect(result.deleteWorkspace).toMatchInlineSnapshot(`undefined`);
});

test("Deleting nonexistent workspace does nothing", async () => {
  // generate a challenge code
  const authorizationHeader = `TODO+${username}`;
  const ids = ["badthing"];
  await expect(
    await deleteWorkspaces({ graphql, ids, authorizationHeader })
  ).rejects.toThrow("Invalid workspace IDs");
});
