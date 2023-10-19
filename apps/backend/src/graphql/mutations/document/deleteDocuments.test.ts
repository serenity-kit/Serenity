import { generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
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
    username: `${generateId()}@example.com`,
    password,
  });
  addedWorkspace = userData1.workspace;
  sessionKey = userData1.sessionKey;
  const folder = userData1.folder;
  const createDocumentResult = await createDocument({
    graphql,
    authorizationHeader: sessionKey,
    parentFolderId: folder.id,
    activeDevice: userData1.webDevice,
    workspaceId: addedWorkspace.id,
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
    `${generateId()}@example.com`,
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
    `${generateId()}@example.com`,
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
  const id = generateId();
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
