import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
const password = "password";
let userData: any = null;
let addedWorkspace: any = null;
let addedFolder: any = null;
let sessionKey = "";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  sessionKey = userData1.sessionKey;
  addedWorkspace = userData1.workspace;
  addedFolder = userData1.folder;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to create a document", async () => {
  const id = uuidv4();
  // can be removed in case we don't need the workpaceKeyId
  // const workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
  //   device: userData1.device,
  //   deviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
  //   workspace: userData1.workspace,
  // });
  const result = await createDocument({
    id,
    graphql,
    authorizationHeader: userData1.sessionKey,
    parentFolderId: userData1.folder.id,
    workspaceId: userData1.workspace.id,
  });
  expect(result.createDocument.id).toBe(id);
});

test("commenter tries to create", async () => {
  const otherUser = await registerUser(
    graphql,
    `${uuidv4()}@example.com`,
    "password"
  );
  await prisma.usersToWorkspaces.create({
    data: {
      userId: otherUser.userId,
      workspaceId: userData1.workspace.id,
      role: Role.COMMENTER,
    },
  });
  await expect(
    (async () =>
      await createDocument({
        id: uuidv4(),
        graphql,
        authorizationHeader: otherUser.sessionKey,
        parentFolderId: userData1.folder.id,
        workspaceId: userData1.workspace.id,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("viewer attempts to create", async () => {
  const otherUser = await registerUser(
    graphql,
    `${uuidv4()}@example.com`,
    "password"
  );
  await prisma.usersToWorkspaces.create({
    data: {
      userId: otherUser.userId,
      workspaceId: userData1.workspace.id,
      role: Role.VIEWER,
    },
  });
  await expect(
    (async () =>
      await createDocument({
        id: uuidv4(),
        graphql,
        authorizationHeader: otherUser.sessionKey,
        parentFolderId: userData1.folder.id,
        workspaceId: userData1.workspace.id,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await createDocument({
        id: uuidv4(),
        graphql,
        authorizationHeader: "badauthkey",
        parentFolderId: userData1.folder.id,
        workspaceId: userData1.workspace.id,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: sessionKey,
  };
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
              parentFolderId: userData1.folder.parentFolderId,
              workspaceId: userData1.workspace.id,
            },
          },
          authorizationHeaders
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
              parentFolderId: userData1.folder.parentFolderId,
              workspaceId: null,
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
