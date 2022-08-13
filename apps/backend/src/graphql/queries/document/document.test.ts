import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { getDocument } from "../../../../test/helpers/document/getDocument";
import { updateDocumentName } from "../../../../test/helpers/document/updateDocumentName";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { Device } from "../../../types/device";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const workspaceId = "5a3484e6-c46e-42ce-a285-088fc1fd6915";
let userId: string | null = null;
let device: Device | null = null;
let sessionKey = "";

beforeAll(async () => {
  await deleteAllRecords();
  const result = await createUserWithWorkspace({
    id: workspaceId,
    username,
  });
  userId = result.user.id;
  device = result.device;
  sessionKey = result.sessionKey;
});

test("user should be retrieve a document", async () => {
  const authorizationHeader = sessionKey;
  const documentId = uuidv4();
  const createDocumentResponse = await createDocument({
    graphql,
    id: documentId,
    parentFolderId: null,
    workspaceId: workspaceId,
    authorizationHeader,
  });
  await updateDocumentName({
    graphql,
    id: documentId,
    name: "Test document",
    authorizationHeader,
  });

  // const createdDocument = createDocumentResponse.createDevice.document;

  const result = await getDocument({
    graphql,
    id: documentId,
    authorizationHeader,
  });
  const retrievedDocument = result.document;
  expect(retrievedDocument).toMatchInlineSnapshot(`
    Object {
      "id": "${documentId}",
      "name": "Test document",
      "parentFolderId": null,
      "workspaceId": "${workspaceId}",
    }
  `);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getDocument({
        graphql,
        id: uuidv4(),
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

test("Input Errors", async () => {
  await expect(
    (async () =>
      await getDocument({
        graphql,
        id: "",
        authorizationHeader: sessionKey,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});
