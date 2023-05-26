import { generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { getWorkspace } from "../../../database/workspace/getWorkspace";

const graphql = setupGraphql();
let workspaceInvitationId = "";
const inviteeUsername = `invitee-${generateId()}@example.com`;
let inviterUserAndDevice: any = null;
let inviteeUserAndDevice: any = null;
let workspaceInvitationResult: any = null;

beforeAll(async () => {
  await deleteAllRecords();
});

test("accept admin role", async () => {
  const inviterUsername = `invite-${generateId()}@example.com`;
  const inviteeUsername = `invitee-${generateId()}@example.com`;
  const workspaceId = generateId();
  const otherWorkspaceId = generateId();
  const role = Role.ADMIN;
  inviterUserAndDevice = await createUserWithWorkspace({
    id: workspaceId,
    username: inviterUsername,
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
  workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role,
    workspaceId,
    authorizationHeader: inviterUserAndDevice.sessionKey,
    mainDevice: inviterUserAndDevice.mainDevice,
  });
  workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  const encryptionPublicKeySignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      inviteeUserAndDevice.mainDevice.encryptionPublicKey,
      sodium.from_base64(inviteeUserAndDevice.signingPrivateKey)
    )
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
    invitationSigningKeyPairSeed:
      workspaceInvitationResult.invitationSigningKeyPairSeed,
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
        expect(member.role).toBe(role);
      } else if (member.username === inviterUsername) {
        expect(member.role).toBe(Role.ADMIN);
      }
    }
  );
});

test("double-accepting invitation does nothing", async () => {
  const lastInviteeAssignedRole = Role.ADMIN;
  const encryptionPublicKeySignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      inviteeUserAndDevice.mainDevice.encryptionPublicKey,
      sodium.from_base64(inviteeUserAndDevice.signingPrivateKey)
    )
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
    invitationSigningKeyPairSeed:
      workspaceInvitationResult.invitationSigningKeyPairSeed,
    authorizationHeader: inviteeUserAndDevice.sessionKey,
  });
  const sharedWorkspace =
    acceptedWorkspaceResult.acceptWorkspaceInvitation.workspace;
  expect(typeof sharedWorkspace.id).toBe("string");
  expect(sharedWorkspace.name).toBe(sharedWorkspace.name);
  expect(sharedWorkspace.members.length).toBe(2);
  sharedWorkspace.members.forEach((member: { userId: string; role: Role }) => {
    if (member.userId === inviteeUsername) {
      expect(member.role).toBe(lastInviteeAssignedRole);
    }
  });
});

test("accept editor role", async () => {
  const inviterUsername = `invite-${generateId()}@example.com`;
  const inviteeUsername = `invitee-${generateId()}@example.com`;
  const workspaceId = generateId();
  const otherWorkspaceId = generateId();
  const role = Role.EDITOR;
  inviterUserAndDevice = await createUserWithWorkspace({
    id: workspaceId,
    username: inviterUsername,
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
  workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role,
    workspaceId,
    authorizationHeader: inviterUserAndDevice.sessionKey,
    mainDevice: inviterUserAndDevice.mainDevice,
  });
  workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  const encryptionPublicKeySignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      inviteeUserAndDevice.mainDevice.encryptionPublicKey,
      sodium.from_base64(inviteeUserAndDevice.signingPrivateKey)
    )
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
    invitationSigningKeyPairSeed:
      workspaceInvitationResult.invitationSigningKeyPairSeed,
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
        expect(member.role).toBe(role);
      } else if (member.username === inviterUsername) {
        expect(member.role).toBe(Role.ADMIN);
      }
    }
  );
});

test("accept commenter role", async () => {
  const inviterUsername = `invite-${generateId()}@example.com`;
  const inviteeUsername = `invitee-${generateId()}@example.com`;
  const workspaceId = generateId();
  const otherWorkspaceId = generateId();
  const role = Role.COMMENTER;
  inviterUserAndDevice = await createUserWithWorkspace({
    id: workspaceId,
    username: inviterUsername,
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
  workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role,
    workspaceId,
    authorizationHeader: inviterUserAndDevice.sessionKey,
    mainDevice: inviterUserAndDevice.mainDevice,
  });
  workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  const encryptionPublicKeySignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      inviteeUserAndDevice.mainDevice.encryptionPublicKey,
      sodium.from_base64(inviteeUserAndDevice.signingPrivateKey)
    )
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
    invitationSigningKeyPairSeed:
      workspaceInvitationResult.invitationSigningKeyPairSeed,
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
        expect(member.role).toBe(role);
      } else if (member.username === inviterUsername) {
        expect(member.role).toBe(Role.ADMIN);
      }
    }
  );
});

test("accept viewer role", async () => {
  const inviterUsername = `invite-${generateId()}@example.com`;
  const inviteeUsername = `invitee-${generateId()}@example.com`;
  const workspaceId = generateId();
  const otherWorkspaceId = generateId();
  const role = Role.VIEWER;
  inviterUserAndDevice = await createUserWithWorkspace({
    id: workspaceId,
    username: inviterUsername,
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
  workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role,
    workspaceId,
    authorizationHeader: inviterUserAndDevice.sessionKey,
    mainDevice: inviterUserAndDevice.mainDevice,
  });
  workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  const encryptionPublicKeySignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      inviteeUserAndDevice.mainDevice.encryptionPublicKey,
      sodium.from_base64(inviteeUserAndDevice.signingPrivateKey)
    )
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
    invitationSigningKeyPairSeed:
      workspaceInvitationResult.invitationSigningKeyPairSeed,
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
        expect(member.role).toBe(role);
      } else if (member.username === inviterUsername) {
        expect(member.role).toBe(Role.ADMIN);
      }
    }
  );
});

test("invalid invitation id should throw error", async () => {
  const encryptionPublicKeySignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      inviteeUserAndDevice.mainDevice.encryptionPublicKey,
      sodium.from_base64(inviteeUserAndDevice.signingPrivateKey)
    )
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
        invitationSigningKeyPairSeed:
          workspaceInvitationResult.invitationSigningKeyPairSeed,
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
  const encryptionPublicKeySignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      inviteeUserAndDevice.mainDevice.encryptionPublicKey,
      sodium.from_base64(inviteeUserAndDevice.signingPrivateKey)
    )
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
        invitationSigningKeyPairSeed:
          workspaceInvitationResult.invitationSigningKeyPairSeed,
        authorizationHeader: inviteeUserAndDevice.sessionKey,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("Unauthenticated", async () => {
  const encryptionPublicKeySignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      inviteeUserAndDevice.mainDevice.encryptionPublicKey,
      sodium.from_base64(inviteeUserAndDevice.signingPrivateKey)
    )
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
        invitationSigningKeyPairSeed:
          workspaceInvitationResult.invitationSigningKeyPairSeed,
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
