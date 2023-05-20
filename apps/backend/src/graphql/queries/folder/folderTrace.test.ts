import { generateId } from "@serenity-tools/common";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { getFolderTrace } from "../../../../test/helpers/folder/getFolderTrace";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
let userData2: any = undefined;
let childFolder: any = undefined;
let grandChildFolder: any = undefined;
const password = "password";
let workspaceKey = "";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: generateId(),
    username: `${generateId()}@example.com`,
    password,
  });
  workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspace: userData1.workspace,
  });
  const childFolderResult = await createFolder({
    graphql,
    name: "child folder",
    id: generateId(),
    parentKey: workspaceKey,
    parentFolderId: userData1.folder.id,
    authorizationHeader: userData1.sessionKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
  });
  childFolder = childFolderResult.createFolder.folder;
  const grandChildFolderResult = await createFolder({
    graphql,
    name: "grandChild folder",
    id: generateId(),
    parentKey: workspaceKey,
    parentFolderId: childFolder.id,
    authorizationHeader: userData1.sessionKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
  });
  grandChildFolder = grandChildFolderResult.createFolder.folder;

  userData2 = await createUserWithWorkspace({
    id: generateId(),
    username: `${generateId()}@example.com`,
    password,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("root folder", async () => {
  const result = await getFolderTrace({
    graphql,
    folderId: userData1.folder.id,
    authorizationHeader: userData1.sessionKey,
  });
  expect(result.folderTrace.length).toBe(1);
  const folder = result.folderTrace[0];
  expect(folder.id).toBe(userData1.folder.id);
});

test("child folder", async () => {
  const result = await getFolderTrace({
    graphql,
    folderId: childFolder.id,
    authorizationHeader: userData1.sessionKey,
  });
  expect(result.folderTrace.length).toBe(2);
  const rootFolderTrace = result.folderTrace[0];
  expect(rootFolderTrace.id).toBe(userData1.folder.id);
  const childFolderTrace = result.folderTrace[1];
  expect(childFolderTrace.id).toBe(childFolder.id);
});

test("grandchild folder", async () => {
  const result = await getFolderTrace({
    graphql,
    folderId: grandChildFolder.id,
    authorizationHeader: userData1.sessionKey,
  });
  expect(result.folderTrace.length).toBe(3);
  const rootFolderTrace = result.folderTrace[0];
  expect(rootFolderTrace.id).toBe(userData1.folder.id);
  const childFolderTrace = result.folderTrace[1];
  expect(childFolderTrace.id).toBe(childFolder.id);
  const grandChildFolderTrace = result.folderTrace[2];
  expect(grandChildFolderTrace.id).toBe(grandChildFolder.id);
});

test("bad folderId", async () => {
  await expect(
    (async () =>
      await getFolderTrace({
        graphql,
        folderId: "bad-folderId",
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrow(/BAD_USER_INPUT/);
});

test("no access to workspace", async () => {
  await expect(
    (async () =>
      await getFolderTrace({
        graphql,
        folderId: userData1.folder.id,
        authorizationHeader: userData2.sessionKey,
      }))()
  ).rejects.toThrow(/FORBIDDEN/);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getFolderTrace({
        graphql,
        folderId: userData1.folder.id,
        authorizationHeader: "bad-session-key",
      }))()
  ).rejects.toThrow(/UNAUTHENTICATED/);
});
