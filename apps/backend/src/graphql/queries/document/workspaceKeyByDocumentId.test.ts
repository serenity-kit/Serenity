import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
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
let documentId = "";
let deviceSigningPublicKey = "";
const password = "password22room5K42";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  sessionKey = userData1.sessionKey;
  documentId = userData1.document.id;
  deviceSigningPublicKey = userData1.webDevice.signingPublicKey;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("key for main workspace", async () => {
  const workspaceKeyResult = await getWorkspaceKeyByDocumentId({
    graphql,
    documentId: userData1.document.id,
    deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
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

test("key for main workspace, main device", async () => {
  const workspaceKeyResult = await getWorkspaceKeyByDocumentId({
    graphql,
    documentId: userData1.document.id,
    deviceSigningPublicKey: userData1.mainDevice.signingPublicKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  const workspaceKey =
    workspaceKeyResult.workspaceKeyByDocumentId.nameWorkspaceKey;
  expect(workspaceKey.generation).toBe(0);
  expect(workspaceKey.workspaceKeyBox.deviceSigningPublicKey).toBe(
    userData1.mainDevice.signingPublicKey
  );
  expect(workspaceKey.workspaceKeyBox.creatorDeviceSigningPublicKey).toBe(
    userData1.mainDevice.signingPublicKey
  );
  expect(workspaceKey.workspaceKeyBox.creatorDevice.signingPublicKey).toBe(
    userData1.mainDevice.signingPublicKey
  );
  expect(workspaceKey.workspaceId).toBe(userData1.workspace.id);
});

test("empty keys on incomplete workspace share", async () => {
  // create new user
  const userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  // invite to workspace
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: userData1.workspace.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    mainDevice: userData1.mainDevice,
  });
  const workspaceInvitation =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation;
  // accept workspace, but don't generate keys
  await acceptWorkspaceInvitation({
    graphql,
    invitationId: workspaceInvitation.id,
    inviteeMainDevice: userData2.mainDevice,
    invitationSigningKeyPairSeed:
      workspaceInvitationResult.invitationSigningKeyPairSeed,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
  });
  const workspaceKeyResult = await getWorkspaceKeyByDocumentId({
    graphql,
    documentId: userData1.document.id,
    deviceSigningPublicKey: userData2.webDevice.signingPublicKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
  });
  const workspaceKey =
    workspaceKeyResult.workspaceKeyByDocumentId.nameWorkspaceKey;
  expect(workspaceKey.generation).toBe(0);
  expect(workspaceKey.workspaceKeyBox).toBe(null);
  expect(workspaceKey.workspaceId).toBe(userData1.workspace.id);
});

test("key for shared workspace", async () => {
  const userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  // share workspace
  await attachUserToWorkspace({
    graphql,
    hostUserId: userData1.user.id,
    hostSessionKey: userData1.sessionKey,
    hostWebDevice: userData1.webDevice,
    hostMainDevice: userData1.mainDevice,
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
    deviceSigningPublicKey: userData2.webDevice.signingPublicKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
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
  expect(workspaceKey.workspaceKeyBox.creatorDevice.signingPublicKey).toBe(
    userData1.webDevice.signingPublicKey
  );
  expect(workspaceKey.workspaceId).toBe(userData1.workspace.id);
});

test("error on unauthorized workspace", async () => {
  const userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  await expect(
    (async () =>
      await getWorkspaceKeyByDocumentId({
        graphql,
        documentId: userData2.document.id,
        deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("error on invalid document", async () => {
  await expect(
    (async () =>
      await getWorkspaceKeyByDocumentId({
        graphql,
        documentId: "bad-document-id",
        deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("bad deviceSigningPublicKey", async () => {
  const userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  await expect(
    (async () =>
      await getWorkspaceKeyByDocumentId({
        graphql,
        documentId: userData1.document.id,
        deviceSigningPublicKey: userData2.webDevice.signingPublicKey,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrowError();
});

test("unauthenticated", async () => {
  await expect(
    (async () =>
      await getWorkspaceKeyByDocumentId({
        graphql,
        documentId: userData1.document.id,
        deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
        authorizationHeader: "badauthkey",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: deriveSessionAuthorization({ sessionKey }).authorization,
  };
  const query = gql`
    query workspaceKeyByDocumentId(
      $documentId: ID!
      $deviceSigningPublicKey: String!
    ) {
      workspaceKeyByDocumentId(
        documentId: $documentId
        deviceSigningPublicKey: $deviceSigningPublicKey
      ) {
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
            deviceSigningPublicKey: deviceSigningPublicKey,
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid deviceSigningPublicKey", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            documentId,
            deviceSigningPublicKey: null,
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
