import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { v4 as uuidv4 } from "uuid";

const graphql = setupGraphql();
let userId1 = "";
const username = "user";
const password = "password";
let sessionKey1 = "";
let isSetupComplete = false;

beforeAll(async () => {
  await deleteAllRecords();
});

// we have to run registerUser here because graphql isn't setup in beforeAll()
beforeEach(async () => {
  if (!isSetupComplete) {
    const registerUserResult1 = await registerUser(graphql, username, password);
    sessionKey1 = registerUserResult1.sessionKey;
    userId1 = registerUserResult1.userId;
    isSetupComplete = true;
  }
});

test("user can create initial workspace structure", async () => {
  // generate a challenge code
  const authorizationHeader = sessionKey1;
  const workspaceId = uuidv4();
  const workspaceName = "New Workspace";
  const folderId = uuidv4();
  const folderIdSignature = `TODO+${folderId}`;
  const folderName = "Getting started";
  const documentId = uuidv4();
  const documentName = "Introduction";
  const result = await createInitialWorkspaceStructure({
    graphql,
    workspaceId,
    workspaceName,
    folderId,
    folderIdSignature,
    folderName,
    documentId,
    documentName,
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
  expect(folder.name).toBe("Getting started");
  // expect(document.name).toBe("Introduction");
  workspace.members.forEach((member: { userId: string; isAdmin: any }) => {
    expect(member.isAdmin).toBe(true);
  });
});
