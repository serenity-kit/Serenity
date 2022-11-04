import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { deleteDocuments } from "../../../../test/helpers/document/deleteDocuments";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password";
let user1Data: any = undefined;
let user1WorkspaceKey: any = undefined;

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
  const createDocumentResult = await createDocument({
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    graphql,
    authorizationHeader: user1Data.sessionKey,
    parentFolderId: user1Data.folder.id,
    contentSubkeyId: 1,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to delete a document", async () => {
  const result = await deleteDocuments({
    graphql,
    ids: [user1Data.document.id],
    authorizationHeader: user1Data.sessionKey,
  });
  expect(result.deleteDocuments).toMatchInlineSnapshot(`
    {
      "status": "success",
    }
  `);
});

test("Deleting nonexistent document does nothing", async () => {
  const result = await deleteDocuments({
    graphql,
    ids: ["bad-id"],
    authorizationHeader: user1Data.sessionKey,
  });
  expect(result.deleteDocuments).toMatchInlineSnapshot(`
    {
      "status": "success",
    }
  `);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await deleteDocuments({
        graphql,
        ids: [user1Data.document.id],
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const query = gql`
    mutation deleteDocuments($input: DeleteDocumentsInput!) {
      deleteDocuments(input: $input) {
        status
      }
    }
  `;
  const id = uuidv4();
  test("Invalid ids", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              ids: null,
            },
          },
          { authorizationHeaders: user1Data.sessionKey }
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
          { authorizationHeaders: user1Data.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    await expect(
      (async () =>
        await graphql.client.request(query, null, {
          authorizationHeaders: user1Data.sessionKey,
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
