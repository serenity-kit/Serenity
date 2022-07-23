import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { deleteWorkspaces } from "../../../../test/helpers/workspace/deleteWorkspaces";
import { v4 as uuidv4 } from "uuid";

const graphql = setupGraphql();
const username = "user1";
const password = "password";
let addedWorkspace: any = null;
let sessionKey = "";

const setup = async () => {
  const registerUserResult = await registerUser(graphql, username, password);
  sessionKey = registerUserResult.sessionKey;
  const createWorkspaceResult = await createInitialWorkspaceStructure({
    workspaceName: "workspace 1",
    workspaceId: "abc",
    folderName: "Getting started",
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey,
  });
  addedWorkspace =
    createWorkspaceResult.createInitialWorkspaceStructure.workspace;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test.only("user should be able to delete a workspace", async () => {
  // generate a challenge code
  const authorizationHeader = sessionKey;
  const ids = [addedWorkspace.id];
  const result = await deleteWorkspaces({ graphql, ids, authorizationHeader });
  expect(result.deleteWorkspace).toMatchInlineSnapshot(`undefined`);
});

test("Deleting nonexistent workspace does nothing", async () => {
  // generate a challenge code
  const authorizationHeader = sessionKey;
  const ids = ["badthing"];
  await expect(
    await deleteWorkspaces({ graphql, ids, authorizationHeader })
  ).rejects.toThrow("Invalid workspace IDs");
});

test("Unauthenticated", async () => {
  const ids = [addedWorkspace.id];
  await expect(
    (async () =>
      await deleteWorkspaces({
        graphql,
        ids,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
