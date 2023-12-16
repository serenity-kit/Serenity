import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import { Role } from "../../../../prisma/generated/output";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
const password = "password22room5K42";
let userData: any = null;
let addedWorkspace: any = null;
let addedFolder: any = null;
let sessionKey = "";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
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
  // can be removed in case we don't need the workpaceKeyId
  // const workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
  //   device: userData1.device,
  //   deviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
  //   workspace: userData1.workspace,
  // });
  const result = await createDocument({
    graphql,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    parentFolderId: userData1.folder.id,
    activeDevice: userData1.webDevice,
    workspaceId: userData1.workspace.id,
  });
  expect(result.createDocument.id).toBeDefined();
});

test("commenter tries to create", async () => {
  const otherUser = await registerUser(
    graphql,
    `${generateId()}@example.com`,
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
        graphql,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: otherUser.sessionKey,
        }).authorization,
        parentFolderId: userData1.folder.id,
        activeDevice: userData1.webDevice,
        workspaceId: userData1.workspace.id,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("viewer attempts to create", async () => {
  const otherUser = await registerUser(
    graphql,
    `${generateId()}@example.com`,
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
        graphql,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: otherUser.sessionKey,
        }).authorization,
        parentFolderId: userData1.folder.id,
        activeDevice: userData1.webDevice,
        workspaceId: userData1.workspace.id,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await createDocument({
        graphql,
        authorizationHeader: "badauthkey",
        parentFolderId: userData1.folder.id,
        workspaceId: userData1.workspace.id,
        activeDevice: userData1.webDevice,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: deriveSessionAuthorization({ sessionKey }).authorization,
  };
  const query = gql`
    mutation createDocument($input: CreateDocumentInput!) {
      createDocument(input: $input) {
        id
      }
    }
  `;
  test("Invalid workspaceId", async () => {
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          {
            input: {
              id: generateId,
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
        await graphql.client.request<any>(
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
        await graphql.client.request<any>(
          query,
          undefined,
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
