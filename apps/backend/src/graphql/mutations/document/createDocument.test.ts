import {
  createDocumentKey,
  folderDerivedKeyContext,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password";
let userData: any = null;

const setup = async () => {
  userData = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to create a document", async () => {
  const id = uuidv4();
  const workspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: userData.device,
    deviceEncryptionPrivateKey: userData.encryptionPrivateKey,
    workspace: userData.workspace,
  });
  const folderKeyResult = await kdfDeriveFromKey({
    key: workspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: userData.folder.subkeyId,
  });
  let documentContentKeyResult = await createDocumentKey({
    folderKey: folderKeyResult.key,
  });
  const result = await createDocument({
    graphql,
    id,
    parentFolderId: userData.folder.parentFolderId,
    workspaceKeyId: userData.workspace.currentWorkspaceKey.id,
    workspaceId: userData.workspace.id,
    contentSubkeyId: documentContentKeyResult.subkeyId,
    authorizationHeader: userData.sessionKey,
  });
  expect(result.createDocument.id).toBe(id);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await createDocument({
        graphql,
        id: uuidv4(),
        parentFolderId: userData.folder.parentFolderId,
        workspaceKeyId: userData.workspace.currentWorkspaceKey.id,
        contentSubkeyId: 1,
        workspaceId: userData.workspace.id,
        authorizationHeader: "badauthkey",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const id = uuidv4();
  const query = gql`
    mutation createDocument($input: CreateDocumentInput!) {
      createDocument(input: $input) {
        id
      }
    }
  `;
  test("Invalid Id", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              id: null,
              parentFolderId: null,
              workspaceId: userData.workspace.id,
            },
          },
          { authorizationHeaders: userData.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid workspaceId", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              id: uuidv4,
              parentFolderId: null,
              workspaceId: null,
            },
          },
          { authorizationHeaders: userData.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: null,
          },
          { authorizationHeaders: userData.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    await expect(
      (async () =>
        await graphql.client.request(query, null, {
          authorizationHeaders: userData.sessionKey,
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
