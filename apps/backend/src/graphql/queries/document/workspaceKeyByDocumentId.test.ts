import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyByDocumentId } from "../../../../test/helpers/document/getWorkspaceKeyByDocumentId";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { attachUserToWorkspace } from "../../../../test/helpers/workspace/attachUserToWorkspace";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
let sessionKey = "";
const password = "password";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  sessionKey = userData1.sessionKey;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("key for main workspace", async () => {
  const workspaceKeyResult = await getWorkspaceKeyByDocumentId({
    graphql,
    documentId: userData1.document.id,
    authorizationHeader: userData1.sessionKey,
  });
  const workspaceKey =
    workspaceKeyResult.workspaceKeyByDocumentId.nameWorkspaceKey;
  expect(workspaceKey.generation).toBe(0);
  expect(workspaceKey.workspaceKeyBox.deviceSigningPublicKey).toBe(
    userData1.webDevice.signingPublicKey
  );
  expect(workspaceKey.workspaceKeyBox.creatorDeviceSigningPublicKey).toBe(
    userData1.mainDevice.signingPublicKey
  );
  expect(workspaceKey.workspaceId).toBe(userData1.workspace.id);
});

test("empty keys on incomplete workspace share", async () => {
  // create new user
  const userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  // invite to workspace
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    workspaceId: userData1.workspace.id,
    authorizationHeader: userData1.sessionKey,
  });
  const workspaceInvitation =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation;
  const invitationSigningPrivateKey =
    workspaceInvitationResult.invitationSigningPrivateKey;
  // accept workspace, but don't generate keys
  await acceptWorkspaceInvitation({
    graphql,
    workspaceInvitationId: workspaceInvitation.id,
    invitationSigningPrivateKey,
    inviteeUsername: userData2.user.username,
    inviteeMainDevice: userData2.mainDevice,
    authorizationHeader: userData2.sessionKey,
  });
  const workspaceKeyResult = await getWorkspaceKeyByDocumentId({
    graphql,
    documentId: userData1.document.id,
    authorizationHeader: userData2.sessionKey,
  });
  const workspaceKey =
    workspaceKeyResult.workspaceKeyByDocumentId.nameWorkspaceKey;
  expect(workspaceKey.generation).toBe(0);
  expect(workspaceKey.workspaceKeyBox).toBe(null);
  expect(workspaceKey.workspaceId).toBe(userData1.workspace.id);
});

test("key for shared workspace", async () => {
  const userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  // share workspace
  await attachUserToWorkspace({
    graphql,
    hostUserId: userData1.user.id,
    hostSessionKey: userData1.sessionKey,
    hostWebDevice: userData1.webDevice,
    guestUserId: userData2.user.id,
    guestSessionKey: userData2.sessionKey,
    guestWebDevice: userData2.webDevice,
    guestMainDevice: userData2.mainDevice,
    workspaceId: userData1.workspace.id,
    role: Role.EDITOR,
  });
  const workspaceKeyResult = await getWorkspaceKeyByDocumentId({
    graphql,
    documentId: userData1.document.id,
    authorizationHeader: userData2.sessionKey,
  });
  const workspaceKey =
    workspaceKeyResult.workspaceKeyByDocumentId.nameWorkspaceKey;
  expect(workspaceKey.generation).toBe(0);
  expect(workspaceKey.workspaceKeyBox.deviceSigningPublicKey).toBe(
    userData2.webDevice.signingPublicKey
  );
  expect(workspaceKey.workspaceKeyBox.creatorDeviceSigningPublicKey).toBe(
    userData1.webDevice.signingPublicKey
  );
  expect(workspaceKey.workspaceId).toBe(userData1.workspace.id);
});

test("error on unauthorized workspace", async () => {
  const userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  await expect(
    (async () =>
      await getWorkspaceKeyByDocumentId({
        graphql,
        documentId: userData2.document.id,
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("error on invalid document", async () => {
  await expect(
    (async () =>
      await getWorkspaceKeyByDocumentId({
        graphql,
        documentId: "bad-document-id",
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("unauthenticated", async () => {
  await expect(
    (async () =>
      await getWorkspaceKeyByDocumentId({
        graphql,
        documentId: userData1.document.id,
        authorizationHeader: "badauthkey",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: sessionKey,
  };
  const query = gql`
    query workspaceKeyByDocumentId($documentId: ID!) {
      workspaceKeyByDocumentId(documentId: $documentId) {
        nameWorkspaceKey {
          id
          workspaceId
          generation
        }
      }
    }
  `;
  test("Invalid documentId", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            documentId: null,
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
