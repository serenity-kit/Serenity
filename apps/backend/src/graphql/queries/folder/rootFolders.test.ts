import { folderDerivedKeyContext } from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import setupGraphql, {
  TestContext,
} from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let user1Data: any = undefined;
let user2Data: any = undefined;
const password = "password";
let user1WorkspaceKey = "";
let user2WorkspaceKey = "";
const parentFolderId = uuidv4();
const folderId = uuidv4();
const childFolderId = uuidv4();

const setup = async () => {
  user1Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  user1WorkspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: user1Data.device,
    deviceEncryptionPrivateKey: user1Data.encryptionPrivateKey,
    workspace: user1Data.workspace,
  });

  user2Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  user1WorkspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: user2Data.device,
    deviceEncryptionPrivateKey: user2Data.encryptionPrivateKey,
    workspace: user2Data.workspace,
  });

  const folderKey = await kdfDeriveFromKey({
    key: user1WorkspaceKey,
    subkeyId: user1Data.folder.subkeyId,
    context: folderDerivedKeyContext,
  });

  await createFolder({
    graphql,
    name: "other folder",
    id: uuidv4(),
    parentKey: folderKey.key,
    parentFolderId: null,
    authorizationHeader: user2Data.sessionKey,
    workspaceId: user2Data.workspace.id,
    workspaceKeyId: user2Data.workspace.currentWorkspaceKey.id,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

type Props = {
  graphql: TestContext;
  workspaceId: string;
  first: number;
  authorizationHeader: string;
};
const getRootFolders = async ({
  graphql,
  workspaceId,
  first,
  authorizationHeader,
}: Props) => {
  const query = gql`
    query rootFolders($workspaceId: ID!, $first: Int!) {
      rootFolders(workspaceId: $workspaceId, first: $first) {
        edges {
          node {
            id
            parentFolderId
            rootFolderId
            workspaceId
            encryptedName
            encryptedNameNonce
            keyDerivationTrace {
              workspaceKeyId
              parentFolders {
                folderId
                subkeyId
                parentFolderId
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
  return graphql.client.request(
    query,
    {
      workspaceId,
      first,
    },
    { authorization: authorizationHeader }
  );
};

test("user should be able to list folders in a workspace when preloaded with initial workspace", async () => {
  const result = await getRootFolders({
    graphql,
    workspaceId: user1Data.workspace.id,
    first: 50,
    authorizationHeader: user1Data.sessionKey,
  });
  expect(result.rootFolders.edges.length).toBe(1);
});

test("user should be able to list folders in a workspace with one item", async () => {
  const parentFolderName = "parent folder";
  await createFolder({
    graphql,
    name: parentFolderName,
    id: parentFolderId,
    parentFolderId: null,
    parentKey: user1WorkspaceKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });
  const result = await getRootFolders({
    graphql,
    workspaceId: user1Data.workspace.id,
    first: 50,
    authorizationHeader: user1Data.sessionKey,
  });
  expect(result.rootFolders.edges.length).toBe(2);
  result.rootFolders.edges.forEach(
    (edge: { node: { workspaceId: any; parentFolderId: any } }) => {
      expect(edge.node.workspaceId).toBe(user1Data.workspace.id);
      expect(edge.node.parentFolderId).toBe(null);
    }
  );
});

test("user should be able to list folders in a workspace with multiple items", async () => {
  const folderName = "folder";
  await createFolder({
    graphql,
    name: folderName,
    id: folderId,
    parentFolderId: null,
    parentKey: user1WorkspaceKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });
  const result = await getRootFolders({
    graphql,
    workspaceId: user1Data.workspace.id,
    first: 50,
    authorizationHeader: user1Data.sessionKey,
  });
  expect(result.rootFolders.edges.length).toBe(3);
  result.rootFolders.edges.forEach(
    (edge: { node: { workspaceId: any; parentFolderId: any } }) => {
      expect(edge.node.workspaceId).toBe(user1Data.workspace.id);
      expect(edge.node.parentFolderId).toBe(null);
    }
  );
});

test("user should be able to list without showing subfolders", async () => {
  const childFolderName = "child folder";
  await createFolder({
    graphql,
    name: childFolderName,
    id: childFolderId,
    parentFolderId: folderId,
    parentKey: user1WorkspaceKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });
  const result = await getRootFolders({
    graphql,
    workspaceId: user1Data.workspace.id,
    first: 50,
    authorizationHeader: user1Data.sessionKey,
  });
  expect(result.rootFolders.edges.length).toBe(3);
});

test("retrieving a workspace that doesn't exist throws an error", async () => {
  await expect(
    (async () =>
      await getRootFolders({
        graphql,
        workspaceId: uuidv4(),
        first: 50,
        authorizationHeader: user1Data.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("listing folders that the user doesn't own throws an error", async () => {
  await expect(
    (async () =>
      await getRootFolders({
        graphql,
        workspaceId: user1Data.workspace.id,
        first: 50,
        authorizationHeader: user2Data.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getRootFolders({
        graphql,
        workspaceId: user1Data.workspace.id,
        first: 50,
        authorizationHeader: "",
      }))()
  ).rejects.toThrow(/UNAUTHENTICATED/);
});

test("Unauthorized", async () => {
  await expect(
    (async () =>
      await getRootFolders({
        graphql,
        workspaceId: user1Data.workspace.id,
        first: 10,
        authorizationHeader: user2Data.sessionKey,
      }))()
  ).rejects.toThrow(/Unauthorized/);
});
test("Invalid workspaceId", async () => {
  await expect(
    (async () =>
      await getRootFolders({
        graphql,
        workspaceId: "",
        first: 10,
        authorizationHeader: user1Data.sessionKey,
      }))()
  ).rejects.toThrow(/BAD_USER_INPUT/);
});
