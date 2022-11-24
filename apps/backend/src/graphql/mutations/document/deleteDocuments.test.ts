import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { deleteDocuments } from "../../../../test/helpers/document/deleteDocuments";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
const username = "user1";
const password = "password";
let addedWorkspace: any = null;
let addedDocumentId: any = null;
let sessionKey = "";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  addedWorkspace = userData1.workspace;
  sessionKey = userData1.sessionKey;
  const folder = userData1.folder;
  const createDocumentResult = await createDocument({
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    graphql,
    authorizationHeader: sessionKey,
    parentFolderId: folder.id,
    contentSubkeyId: 1,
    workspaceId: addedWorkspace.id,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
  });
  addedDocumentId = createDocumentResult.createDocument.id;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to delete a document", async () => {
  const authorizationHeader = sessionKey;
  const ids = [addedDocumentId];
  const result = await deleteDocuments({
    graphql,
    ids,
    workspaceId: addedWorkspace.id,
    authorizationHeader,
  });
  expect(result.deleteDocuments).toMatchInlineSnapshot(`
    {
      "status": "success",
    }
  `);
});

test("Deleting nonexistent document does nothing", async () => {
  const authorizationHeader = sessionKey;
  const ids = ["badthing"];
  const result = await deleteDocuments({
    graphql,
    ids,
    workspaceId: addedWorkspace.id,
    authorizationHeader,
  });
  expect(result.deleteDocuments).toMatchInlineSnapshot(`
    {
      "status": "success",
    }
  `);
});

test("commenter attempts to delete", async () => {
  const otherUser = await registerUser(
    graphql,
    `${uuidv4()}@example.com`,
    "password"
  );
  await prisma.usersToWorkspaces.create({
    data: {
      userId: otherUser.userId,
      workspaceId: addedWorkspace.id,
      role: Role.COMMENTER,
    },
  });
  const ids = [addedDocumentId];
  await expect(
    (async () =>
      await deleteDocuments({
        graphql,
        ids,
        workspaceId: addedWorkspace.id,
        authorizationHeader: otherUser.sessionKey,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("viewer attempts to delete", async () => {
  const otherUser = await registerUser(
    graphql,
    `${uuidv4()}@example.com`,
    "password"
  );
  await prisma.usersToWorkspaces.create({
    data: {
      userId: otherUser.userId,
      workspaceId: addedWorkspace.id,
      role: Role.VIEWER,
    },
  });
  const ids = [addedDocumentId];
  await expect(
    (async () =>
      await deleteDocuments({
        graphql,
        ids,
        workspaceId: addedWorkspace.id,
        authorizationHeader: otherUser.sessionKey,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Unauthenticated", async () => {
  const ids = [addedDocumentId];
  await expect(
    (async () =>
      await deleteDocuments({
        graphql,
        ids,
        workspaceId: addedWorkspace.id,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: sessionKey,
  };
  const id = uuidv4();
  const query = gql`
    mutation deleteDocuments($input: DeleteDocumentsInput!) {
      deleteDocuments(input: $input) {
        status
      }
    }
  `;
  test("Invalid ids", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              ids: null,
              workspaceId: addedWorkspace.id,
            },
          },
          authorizationHeaders
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
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
