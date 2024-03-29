import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { getRootFolders } from "../../../../test/helpers/folder/getRootFolders";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
let userData2: any = undefined;
const password = "password22room5K42";
let workspaceKey = "";
let workspaceKey2 = "";

const workspaceId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const otherWorkspaceId = "929ca262-f144-40f7-8fe2-d3147f415f26";
const parentFolderId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const folderId = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const childFolderId = "98b3f4d9-141a-4e11-a0f5-7437a6d1eb4b";
const otherFolderId = "c1c65251-7471-4893-a1b5-e3df937caf66";

let workspace: any = null;

let sessionKey = "";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  workspace = userData1.workspace;
  workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspace: userData1.workspace,
  });

  userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  workspaceKey2 = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData2.device,
    deviceEncryptionPrivateKey: userData2.encryptionPrivateKey,
    workspace: userData2.workspace,
  });
  const createOtherFolderResult = await createFolder({
    graphql,
    name: "other folder",
    id: otherFolderId,
    parentKey: workspaceKey2,
    parentFolderId: null,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
    workspaceId: userData2.workspace.id,
    workspaceKeyId: userData2.workspace.currentWorkspaceKey.id,
    userId: userData2.user.id,
    device: userData2.webDevice,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("list folders in a workspace when preloaded with initial workspace", async () => {
  const result = await getRootFolders({
    graphql,
    workspaceId: userData1.workspace.id,
    first: 50,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  expect(result.rootFolders.edges.length).toBe(1);
});

test("user should be able to list folders in a workspace with one item", async () => {
  const parentFolderName = "parent folder";

  const createParentFolderResult = await createFolder({
    graphql,
    id: parentFolderId,
    name: parentFolderName,
    parentKey: workspaceKey,
    parentFolderId: null,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    userId: userData1.user.id,
    device: userData1.webDevice,
  });

  const result = await getRootFolders({
    graphql,
    workspaceId: userData1.workspace.id,
    first: 50,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  expect(result.rootFolders.edges.length).toBe(2);
  result.rootFolders.edges.forEach(
    (edge: { node: { workspaceId: any; parentFolderId: any } }) => {
      expect(edge.node.workspaceId).toBe(userData1.workspace.id);
      expect(edge.node.parentFolderId).toBe(null);
    }
  );
});

test("user should be able to list folders in a workspace with multiple items", async () => {
  const folderName = "folder";
  const createParentFolderResult = await createFolder({
    graphql,
    id: folderName,
    name: folderId,
    parentKey: workspaceKey,
    parentFolderId: null,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    userId: userData1.user.id,
    device: userData1.webDevice,
  });

  const result = await getRootFolders({
    graphql,
    workspaceId: userData1.workspace.id,
    first: 50,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  expect(result.rootFolders.edges.length).toBe(3);
  result.rootFolders.edges.forEach(
    (edge: { node: { workspaceId: any; parentFolderId: any } }) => {
      expect(edge.node.workspaceId).toBe(userData1.workspace.id);
      expect(edge.node.parentFolderId).toBe(null);
    }
  );
});

test("user should be able to list without showing subfolders", async () => {
  const childFolderName = "child folder";
  const createParentFolderResult = await createFolder({
    graphql,
    id: childFolderId,
    name: childFolderName,
    parentKey: workspaceKey,
    parentFolderId: parentFolderId,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    userId: userData1.user.id,
    device: userData1.webDevice,
  });
  const result = await getRootFolders({
    graphql,
    workspaceId: userData1.workspace.id,
    first: 50,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  expect(result.rootFolders.edges.length).toBe(3);
});

test("retrieving a workspace that doesn't exist throws an error", async () => {
  await expect(
    (async () =>
      await getRootFolders({
        graphql,
        workspaceId: generateId(),
        first: 50,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("listing folders that the user doesn't own throws an error", async () => {
  await expect(
    (async () =>
      await getRootFolders({
        graphql,
        workspaceId: userData2.workspace.id,
        first: 50,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getRootFolders({
        graphql,
        workspaceId: userData2.workspace.id,
        first: 50,
        authorizationHeader: "bad-session-key",
      }))()
  ).rejects.toThrow(/UNAUTHENTICATED/);
});

test("Invalid workspaceId", async () => {
  await expect(
    (async () =>
      await getRootFolders({
        graphql,
        workspaceId: userData2.workspace.id,
        first: 51,
        authorizationHeader: "bad-session-key",
      }))()
  ).rejects.toThrow(/BAD_USER_INPUT/);
});
