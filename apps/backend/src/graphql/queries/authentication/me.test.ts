import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let user1Data: any = undefined;
let user1WorkspaceKey = "";
const password = "password";

const meQuery = gql`
  {
    me {
      id
      username
    }
  }
`;

const meWithWorkspaceLoadingInfoQuery = gql`
  query me(
    $workspaceId: ID
    $documentId: ID
    $returnOtherWorkspaceIfNotFound: Boolean
    $returnOtherDocumentIfNotFound: Boolean
  ) {
    me {
      id
      username
      workspaceLoadingInfo(
        workspaceId: $workspaceId
        returnOtherWorkspaceIfNotFound: $returnOtherWorkspaceIfNotFound
        documentId: $documentId
        returnOtherDocumentIfNotFound: $returnOtherDocumentIfNotFound
      ) {
        id
        isAuthorized
        documentId
      }
    }
  }
`;

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
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to get their username", async () => {
  const authorizationHeader = { authorization: user1Data.sessionKey };
  const result = await graphql.client.request(
    meQuery,
    null,
    authorizationHeader
  );
  expect(result.me.id).toEqual(user1Data.user.id);
  expect(result.me.username).toEqual(user1Data.user.username);
});

test("should be able to get the workspaceLoadingInfo with a defined workspaceId and documentId", async () => {
  const authorizationHeader = { authorization: user1Data.sessionKey };
  const result = await graphql.client.request(
    meWithWorkspaceLoadingInfoQuery,
    {
      workspaceId: user1Data.workspace.id,
      documentId: user1Data.document.id,
      returnOtherWorkspaceIfNotFound: false,
      returnOtherDocumentIfNotFound: false,
    },
    authorizationHeader
  );
  const workspace = result.me.workspaceLoadingInfo;
  expect(workspace.id).toEqual(user1Data.workspace.id);
  expect(workspace.documentId).toEqual(user1Data.document.id);
  expect(workspace.isAuthorized).toEqual(true);
});

test("should get the fallback workspace if the workspaceId is not available and return other is true", async () => {
  const authorizationHeader = { authorization: user1Data.sessionKey };
  const result = await graphql.client.request(
    meWithWorkspaceLoadingInfoQuery,
    {
      workspaceId: "abc",
      documentId: "cde",
      returnOtherWorkspaceIfNotFound: true,
      returnOtherDocumentIfNotFound: true,
    },
    authorizationHeader
  );
  const workspace = result.me.workspaceLoadingInfo;
  expect(workspace.id).toEqual(user1Data.workspace.id);
  expect(workspace.documentId).toEqual(user1Data.document.id);
  expect(workspace.isAuthorized).toEqual(true);
});

test("should get no workspace if the workspaceId is not available and return other is false", async () => {
  const authorizationHeader = { authorization: user1Data.sessionKey };
  const result = await graphql.client.request(
    meWithWorkspaceLoadingInfoQuery,
    {
      workspaceId: "abc",
      documentId: "cde",
      returnOtherWorkspaceIfNotFound: false,
      returnOtherDocumentIfNotFound: false,
    },
    authorizationHeader
  );
  expect(result.me.workspaceLoadingInfo).toBe(null);
});

test("should be able to get the workspaceLoadingInfo, but another documentId if the provided documentId is not available and return other is true", async () => {
  const authorizationHeader = { authorization: user1Data.sessionKey };
  const result = await graphql.client.request(
    meWithWorkspaceLoadingInfoQuery,
    {
      workspaceId: user1Data.workspace.id,
      documentId: "abc",
      returnOtherDocumentIfNotFound: true,
    },
    authorizationHeader
  );
  const workspace = result.me.workspaceLoadingInfo;
  expect(workspace.id).toEqual(user1Data.workspace.id);
  expect(workspace.documentId).toEqual(user1Data.document.id);
  expect(workspace.isAuthorized).toEqual(true);
});

test("should get the workspaceLoadingInfo, but no documentId if the provided documentId is not available and return other is false", async () => {
  const authorizationHeader = { authorization: user1Data.sessionKey };
  const result = await graphql.client.request(
    meWithWorkspaceLoadingInfoQuery,
    {
      workspaceId: user1Data.workspace.id,
      documentId: "abc",
      returnOtherDocumentIfNotFound: false,
    },
    authorizationHeader
  );

  const workspace = result.me.workspaceLoadingInfo;
  expect(workspace.id).toEqual(user1Data.workspace.id);
  expect(workspace.documentId).toEqual(null);
  expect(workspace.isAuthorized).toEqual(true);
});

test("documentId provided but not the workspaceId", async () => {
  const authorizationHeader = { authorization: user1Data.sessionKey };
  await expect(
    (async () =>
      await graphql.client.request(
        meWithWorkspaceLoadingInfoQuery,
        {
          documentId: user1Data.document.id,
        },
        authorizationHeader
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Unauthenticated", async () => {
  const authorizationHeader = { authorization: "lala" };
  const result = await graphql.client.request(
    meQuery,
    null,
    authorizationHeader
  );
  expect(result.me).toEqual(null);
});
