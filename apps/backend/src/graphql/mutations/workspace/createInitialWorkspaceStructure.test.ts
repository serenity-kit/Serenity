import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { v4 as uuidv4 } from "uuid";

const graphql = setupGraphql();
let userId1 = "";
const username = "user";
const password = "password";
let sessionKey1 = "";
let device: any = null;
let encryptionPrivateKey = "";
let signingPrivateKey = "";

const setup = async () => {
  const registerUserResult1 = await registerUser(graphql, username, password);
  registerUserResult1.mainDeviceSigningPublicKey
  sessionKey1 = registerUserResult1.sessionKey;
  userId1 = registerUserResult1.userId;
  device = registerUserResult1.mainDevice;
  encryptionPrivateKey = registerUserResult1.encryptionPrivateKey;
  signingPrivateKey = registerUserResult1.signingPrivateKey;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user can create initial workspace structure", async () => {
  // generate a challenge code
  const authorizationHeader = sessionKey1;
  const workspaceId = uuidv4();
  const workspaceName = "New Workspace";
  const deviceSigningPublicKey = device.signingPublicKey;
  const folderId = uuidv4();
  const folderIdSignature = `TODO+${folderId}`;
  const folderName = "Getting started";
  const documentId = uuidv4();
  const documentName = "Introduction";
  const result = await createInitialWorkspaceStructure({
    graphql,
    workspaceId,
    workspaceName,
    deviceSigningPublicKey,
    deviceAeadCiphertext,
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

test("Unauthenticated", async () => {
  const workspaceId = uuidv4();
  const workspaceName = "New Workspace";
  const deviceSigningPublicKey = 
  const folderId = uuidv4();
  const folderIdSignature = `TODO+${folderId}`;
  const folderName = "Getting started";
  const documentId = uuidv4();
  const documentName = "Introduction";
  await expect(
    (async () =>
      await createInitialWorkspaceStructure({
        graphql,
        workspaceId,
        workspaceName,
        deviceSigningPublicKey,
        deviceAeadCiphertext,
        folderId,
        folderIdSignature,
        folderName,
        documentId,
        documentName,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
