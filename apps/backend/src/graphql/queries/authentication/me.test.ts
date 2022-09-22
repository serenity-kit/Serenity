import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";

const graphql = setupGraphql();
let userId = "";
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const username2 = "08844f05-ef88-4ac0-acf8-1e5163c2dcdb@example.com";
const password = "password";
let sessionKey = "";

const workspace1Name = "workspace 1";
const workspace2Name = "workspace 2";
const workspace1Id = "97b2f730-c15e-471f-ab47-ef0576bb04c2";
const workspace2Id = "a4cbd808-aa39-45d7-b359-37ae934ca5a4";
const workspace1DocumentId = "3593ca39-3411-4d44-b803-8ee60edeeec2";

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
  const registerUserResult = await registerUser(graphql, username, password);
  userId = registerUserResult.userId;
  sessionKey = registerUserResult.sessionKey;

  await createInitialWorkspaceStructure({
    workspaceName: workspace1Name,
    workspaceId: workspace1Id,
    deviceSigningPublicKey: registerUserResult.mainDevice.signingPublicKey,
    deviceEncryptionPublicKey:
      registerUserResult.mainDevice.encryptionPublicKey,
    deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    folderName: "Getting started",
    documentName: "Introduction",
    documentId: workspace1DocumentId,
    graphql,
    authorizationHeader: sessionKey,
  });
  await createInitialWorkspaceStructure({
    workspaceName: workspace2Name,
    workspaceId: workspace2Id,
    deviceSigningPublicKey: registerUserResult.mainDevice.signingPublicKey,
    deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
    deviceEncryptionPublicKey:
      registerUserResult.mainDevice.encryptionPublicKey,
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    folderName: "Getting started",
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to get their username", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const result = await graphql.client.request(
    meQuery,
    null,
    authorizationHeader
  );
  expect(result.me.id).toEqual(userId);
  expect(result.me.username).toEqual(username);
});

test("should be able to get the workspaceLoadingInfo with a defined workspaceId and documentId", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const result = await graphql.client.request(
    meWithWorkspaceLoadingInfoQuery,
    {
      workspaceId: workspace1Id,
      documentId: workspace1DocumentId,
      returnOtherWorkspaceIfNotFound: false,
      returnOtherDocumentIfNotFound: false,
    },
    authorizationHeader
  );
  expect(result.me.workspaceLoadingInfo).toMatchInlineSnapshot(`
    {
      "documentId": "3593ca39-3411-4d44-b803-8ee60edeeec2",
      "id": "97b2f730-c15e-471f-ab47-ef0576bb04c2",
      "isAuthorized": true,
    }
  `);
});

test("should get the fallback workspace if the workspaceId is not available and return other is true", async () => {
  const authorizationHeader = { authorization: sessionKey };
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
  expect(result.me.workspaceLoadingInfo).toMatchInlineSnapshot(`
    {
      "documentId": "3593ca39-3411-4d44-b803-8ee60edeeec2",
      "id": "97b2f730-c15e-471f-ab47-ef0576bb04c2",
      "isAuthorized": true,
    }
  `);
});

test("should get no workspace if the workspaceId is not available and return other is false", async () => {
  const authorizationHeader = { authorization: sessionKey };
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
  const authorizationHeader = { authorization: sessionKey };
  const result = await graphql.client.request(
    meWithWorkspaceLoadingInfoQuery,
    {
      workspaceId: workspace1Id,
      documentId: "abc",
      returnOtherDocumentIfNotFound: true,
    },
    authorizationHeader
  );
  expect(result.me.workspaceLoadingInfo).toMatchInlineSnapshot(`
    {
      "documentId": "3593ca39-3411-4d44-b803-8ee60edeeec2",
      "id": "97b2f730-c15e-471f-ab47-ef0576bb04c2",
      "isAuthorized": true,
    }
  `);
});

test("should get the workspaceLoadingInfo, but no documentId if the provided documentId is not available and return other is false", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const result = await graphql.client.request(
    meWithWorkspaceLoadingInfoQuery,
    {
      workspaceId: workspace1Id,
      documentId: "abc",
      returnOtherDocumentIfNotFound: false,
    },
    authorizationHeader
  );
  expect(result.me.workspaceLoadingInfo).toMatchInlineSnapshot(`
    {
      "documentId": null,
      "id": "97b2f730-c15e-471f-ab47-ef0576bb04c2",
      "isAuthorized": true,
    }
  `);
});

test("documentId provided but not the workspaceId", async () => {
  const authorizationHeader = { authorization: sessionKey };
  await expect(
    (async () =>
      await graphql.client.request(
        meWithWorkspaceLoadingInfoQuery,
        {
          documentId: workspace1DocumentId,
        },
        authorizationHeader
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Unauthenticated", async () => {
  const authorizationHeader = { authorization: "lala" };
  await expect(
    (async () =>
      await graphql.client.request(meQuery, null, authorizationHeader))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
