import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";

const graphql = setupGraphql();
let userId1 = "";
const username = "user";
const password = "password";
let mainDeviceSigningPublicKey1 = "";
let isSetupComplete = false;

beforeAll(async () => {
  await deleteAllRecords();
});

// we have to run registerUser here because graphql isn't setup in beforeAll()
beforeEach(async () => {
  if (!isSetupComplete) {
    const registerUserResult1 = await registerUser(graphql, username, password);
    mainDeviceSigningPublicKey1 =
      registerUserResult1.mainDeviceSigningPublicKey;
    userId1 = registerUserResult1.userId;
    isSetupComplete = true;
  }
});

test("user can create initial workspace structure", async () => {
  // generate a challenge code
  const authorizationHeader = mainDeviceSigningPublicKey1;
  const workspaceId = "abc";
  const workspaceName = "New Workspace";
  const result = await createInitialWorkspaceStructure({
    graphql,
    workspaceId,
    workspaceName,
    authorizationHeader,
  });
  const workspace = result.createInitialWorkspaceStructure.workspace;
  // const document = result.createInitialWorkspaceStructure.document;
  const folder = result.createInitialWorkspaceStructure.folder;
  expect(workspace.name).toBe(workspaceName);
  expect(workspace.id).toBe(workspaceId);
  expect(workspace.members.length).toBe(1);
  // expect(document.workspaceId).toBe(workspaceId);
  // expect(document.parentFolderId).toBe(folder.id);
  expect(folder.workspaceId).toBe(workspaceId);
  expect(folder.parentFolderId).toBe(null);
  expect(folder.name).toBe("Getting Started");
  // expect(document.name).toBe("Introduction");
  workspace.members.forEach((member: { userId: string; isAdmin: any }) => {
    expect(member.isAdmin).toBe(true);
  });
});
