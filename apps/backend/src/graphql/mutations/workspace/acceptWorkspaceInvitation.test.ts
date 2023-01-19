import sodium from "@serenity-tools/libsodium";
import { gql } from "graphql-request";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { getWorkspace } from "../../../database/workspace/getWorkspace";

const graphql = setupGraphql();
const workspaceId = "workspace1";
const otherWorkspaceId = "workspace2";
let workspaceInvitationId = "";
let invitationSigningPrivateKey = "";
let inviteeUsername = "invitee@example.com";
let inviteeUserAndDevice: any = null;

beforeAll(async () => {
  await deleteAllRecords();
});

test("user should be able to accept an invitation", async () => {
  const inviterUserName = "inviter@example.com";
  const inviterUserAndDevice = await createUserWithWorkspace({
    id: workspaceId,
    username: inviterUserName,
  });
  const device = inviterUserAndDevice.device;
  inviteeUserAndDevice = await createUserWithWorkspace({
    id: otherWorkspaceId,
    username: inviteeUsername,
  });
  const workspace = await getWorkspace({
    id: workspaceId,
    userId: inviterUserAndDevice.user.id,
    deviceSigningPublicKey: device.signingPublicKey,
  });
  if (!workspace) {
    throw new Error("workspace not found");
  }
  const createWorkspaceResult = await createWorkspaceInvitation({
    graphql,
    workspaceId,
    authorizationHeader: inviterUserAndDevice.sessionKey,
  });
  workspaceInvitationId =
    createWorkspaceResult.createWorkspaceInvitation.workspaceInvitation.id;
  invitationSigningPrivateKey =
    createWorkspaceResult.invitationSigningPrivateKey;
  const encryptionPublicKeySignature = sodium.crypto_sign_detached(
    inviteeUserAndDevice.mainDevice.encryptionPublicKey,
    inviteeUserAndDevice.signingPrivateKey
  );
  const acceptedWorkspaceResult = await acceptWorkspaceInvitation({
    graphql,
    workspaceInvitationId,
    inviteeUsername: inviteeUserAndDevice.user.username,
    inviteeMainDevice: {
      userId: inviteeUserAndDevice.user.id,
      signingPublicKey: inviteeUserAndDevice.mainDevice.signingPublicKey,
      encryptionPublicKey: inviteeUserAndDevice.mainDevice.encryptionPublicKey,
      encryptionPublicKeySignature: encryptionPublicKeySignature,
    },
    invitationSigningPrivateKey,
    authorizationHeader: inviteeUserAndDevice.sessionKey,
  });
  const sharedWorkspace =
    acceptedWorkspaceResult.acceptWorkspaceInvitation.workspace;
  expect(typeof sharedWorkspace.id).toBe("string");
  expect(sharedWorkspace.name).toBe(sharedWorkspace.name);
  expect(sharedWorkspace.members.length).toBe(2);
  sharedWorkspace.members.forEach(
    (member: { username: string; role: Role }) => {
      if (member.username === inviteeUsername) {
        expect(member.role).not.toBe(Role.ADMIN);
      } else if (member.username === inviterUserName) {
        expect(member.role).toBe(Role.ADMIN);
      }
    }
  );
});

test("double-accepting invitation does nothing", async () => {
  const encryptionPublicKeySignature = sodium.crypto_sign_detached(
    inviteeUserAndDevice.mainDevice.encryptionPublicKey,
    inviteeUserAndDevice.signingPrivateKey
  );
  const acceptedWorkspaceResult = await acceptWorkspaceInvitation({
    graphql,
    workspaceInvitationId,
    inviteeUsername: inviteeUserAndDevice.user.username,
    inviteeMainDevice: {
      userId: inviteeUserAndDevice.user.id,
      signingPublicKey: inviteeUserAndDevice.mainDevice.signingPublicKey,
      encryptionPublicKey: inviteeUserAndDevice.mainDevice.encryptionPublicKey,
      encryptionPublicKeySignature: encryptionPublicKeySignature,
    },
    invitationSigningPrivateKey,
    authorizationHeader: inviteeUserAndDevice.sessionKey,
  });
  const sharedWorkspace =
    acceptedWorkspaceResult.acceptWorkspaceInvitation.workspace;
  expect(typeof sharedWorkspace.id).toBe("string");
  expect(sharedWorkspace.name).toBe(sharedWorkspace.name);
  expect(sharedWorkspace.members.length).toBe(2);
  sharedWorkspace.members.forEach((member: { userId: string; role: Role }) => {
    if (member.userId === inviteeUsername) {
      expect(member.role).not.toBe(Role.ADMIN);
    }
  });
});

test("invalid invitation id should throw error", async () => {
  const encryptionPublicKeySignature = sodium.crypto_sign_detached(
    inviteeUserAndDevice.mainDevice.encryptionPublicKey,
    inviteeUserAndDevice.signingPrivateKey
  );
  await expect(
    (async () =>
      await acceptWorkspaceInvitation({
        graphql,
        workspaceInvitationId: "invalid",
        inviteeUsername: inviteeUserAndDevice.user.username,
        inviteeMainDevice: {
          userId: inviteeUserAndDevice.user.id,
          signingPublicKey: inviteeUserAndDevice.mainDevice.signingPublicKey,
          encryptionPublicKey:
            inviteeUserAndDevice.mainDevice.encryptionPublicKey,
          encryptionPublicKeySignature: encryptionPublicKeySignature,
        },
        invitationSigningPrivateKey,
        authorizationHeader: inviteeUserAndDevice.sessionKey,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("expired invitation id should throw error", async () => {
  await prisma.workspaceInvitations.update({
    where: {
      id: workspaceInvitationId,
    },
    data: {
      expiresAt: new Date(Date.now() - 1000),
    },
  });
  const encryptionPublicKeySignature = sodium.crypto_sign_detached(
    inviteeUserAndDevice.mainDevice.encryptionPublicKey,
    inviteeUserAndDevice.signingPrivateKey
  );
  await expect(
    (async () =>
      await acceptWorkspaceInvitation({
        graphql,
        workspaceInvitationId: "invalid",
        inviteeUsername: inviteeUserAndDevice.user.username,
        inviteeMainDevice: {
          userId: inviteeUserAndDevice.user.id,
          signingPublicKey: inviteeUserAndDevice.mainDevice.signingPublicKey,
          encryptionPublicKey:
            inviteeUserAndDevice.mainDevice.encryptionPublicKey,
          encryptionPublicKeySignature: encryptionPublicKeySignature,
        },
        invitationSigningPrivateKey,
        authorizationHeader: inviteeUserAndDevice.sessionKey,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("invalid signature should throw error", async () => {
  await prisma.workspaceInvitations.update({
    where: {
      id: workspaceInvitationId,
    },
    data: {
      expiresAt: new Date(Date.now() - 1000),
    },
  });
  const encryptionPublicKeySignature = sodium.crypto_sign_detached(
    inviteeUserAndDevice.mainDevice.encryptionPublicKey,
    inviteeUserAndDevice.signingPrivateKey
  );
  const badSigningKeys = sodium.crypto_sign_keypair();
  await expect(
    (async () =>
      await acceptWorkspaceInvitation({
        graphql,
        workspaceInvitationId: workspaceInvitationId,
        inviteeUsername: inviteeUserAndDevice.user.username,
        inviteeMainDevice: {
          userId: inviteeUserAndDevice.user.id,
          signingPublicKey: inviteeUserAndDevice.mainDevice.signingPublicKey,
          encryptionPublicKey:
            inviteeUserAndDevice.mainDevice.encryptionPublicKey,
          encryptionPublicKeySignature: encryptionPublicKeySignature,
        },
        invitationSigningPrivateKey: badSigningKeys.privateKey,
        authorizationHeader: inviteeUserAndDevice.sessionKey,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("Unauthenticated", async () => {
  const encryptionPublicKeySignature = sodium.crypto_sign_detached(
    inviteeUserAndDevice.mainDevice.encryptionPublicKey,
    inviteeUserAndDevice.signingPrivateKey
  );
  await expect(
    (async () =>
      await acceptWorkspaceInvitation({
        graphql,
        workspaceInvitationId,
        inviteeUsername: inviteeUserAndDevice.user.username,
        inviteeMainDevice: {
          userId: inviteeUserAndDevice.user.id,
          signingPublicKey: inviteeUserAndDevice.mainDevice.signingPublicKey,
          encryptionPublicKey:
            inviteeUserAndDevice.mainDevice.encryptionPublicKey,
          encryptionPublicKeySignature: encryptionPublicKeySignature,
        },
        invitationSigningPrivateKey,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: "somesessionkey",
  };
  const query = gql`
    mutation ($input: AcceptWorkspaceInvitationInput!) {
      acceptWorkspaceInvitation(input: $input) {
        workspace {
          id
          name
          members {
            userId
            username
            role
          }
        }
      }
    }
  `;
  test("Invalid workspaceInvitationId", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              workspaceInvitationId: null,
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
          { input: null },
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
