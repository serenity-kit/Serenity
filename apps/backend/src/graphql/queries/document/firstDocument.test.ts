import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
const password = "password22room5K42";
let sessionKey = "";
let workspaceKey = "";

const workspaceId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const parentFolderId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const folderId = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";

const query = gql`
  query firstDocument($workspaceId: ID!) {
    firstDocument(workspaceId: $workspaceId) {
      id
    }
  }
`;

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspace: userData1.workspace,
  });

  const parentFolderName = "parent folder";
  const folderName = "folder";
  const createParentFolderResult = await createFolder({
    graphql,
    id: parentFolderId,
    name: parentFolderName,
    parentFolderId: null,
    parentKey: workspaceKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    userId: userData1.user.id,
    device: userData1.webDevice,
  });
  const createFolderResult = await createFolder({
    graphql,
    id: folderId,
    name: folderName,
    parentFolderId: parentFolderId,
    parentKey: workspaceKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    userId: userData1.user.id,
    device: userData1.webDevice,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to retrieve the first document", async () => {
  const result = await graphql.client.request<any>(
    query,
    { workspaceId: userData1.workspace.id },
    {
      authorization: deriveSessionAuthorization({
        sessionKey: userData1.sessionKey,
      }).authorization,
    }
  );
  const firstDocument = result.firstDocument;
  expect(firstDocument.id).toBe(userData1.document.id);
});

test("user should not be able to retreive the first document from another workspace", async () => {
  const registerUserResult2 = await registerUser(
    graphql,
    "abddee2d-3a00-4b3f-b893-85c0e67feb9e@example.com",
    password
  );

  const authorizationHeader = {
    authorization: deriveSessionAuthorization({
      sessionKey: registerUserResult2.sessionKey,
    }).authorization,
  };
  await expect(
    (async () =>
      await graphql.client.request<any>(
        query,
        { workspaceId },
        authorizationHeader
      ))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  const authorizationHeader = { authorization: "badauthheader" };
  await expect(
    (async () =>
      await graphql.client.request<any>(
        query,
        { workspaceId },
        authorizationHeader
      ))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

test("Input Errors", async () => {
  const authorizationHeader = {
    authorization: deriveSessionAuthorization({ sessionKey }).authorization,
  };
  await expect(
    (async () =>
      await graphql.client.request<any>(
        query,
        undefined,
        authorizationHeader
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
  await expect(
    (async () =>
      await graphql.client.request<any>(
        query,
        { workspaceId: null },
        authorizationHeader
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});
