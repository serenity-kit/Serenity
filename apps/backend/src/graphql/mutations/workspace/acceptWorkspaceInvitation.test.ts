import { generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { getWorkspace } from "../../../database/workspace/getWorkspace";

const graphql = setupGraphql();
let invitationId = "";
let workspaceId = "";
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
  workspaceId = generateId();
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
  invitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;

  const acceptedWorkspaceResult = await acceptWorkspaceInvitation({
    graphql,
    invitationId,
    inviteeMainDevice: inviteeUserAndDevice.mainDevice,
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

  const acceptedWorkspaceResult = await acceptWorkspaceInvitation({
    graphql,
    invitationId,
    inviteeMainDevice: inviteeUserAndDevice.mainDevice,
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
  workspaceId = generateId();
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
  invitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  const acceptedWorkspaceResult = await acceptWorkspaceInvitation({
    graphql,
    invitationId,
    inviteeMainDevice: inviteeUserAndDevice.mainDevice,
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
  workspaceId = generateId();
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
  invitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;

  const acceptedWorkspaceResult = await acceptWorkspaceInvitation({
    graphql,
    invitationId,
    inviteeMainDevice: inviteeUserAndDevice.mainDevice,
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
  workspaceId = generateId();
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
  invitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;

  const acceptedWorkspaceResult = await acceptWorkspaceInvitation({
    graphql,
    invitationId,
    inviteeMainDevice: inviteeUserAndDevice.mainDevice,
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
  const workspaceInvitationResult2 = await createWorkspaceInvitation({
    graphql,
    role: Role.ADMIN,
    workspaceId,
    authorizationHeader: inviterUserAndDevice.sessionKey,
    mainDevice: inviterUserAndDevice.mainDevice,
  });
  const invitationId2 =
    workspaceInvitationResult2.createWorkspaceInvitation.workspaceInvitation.id;

  await expect(
    (async () =>
      await acceptWorkspaceInvitation({
        graphql,
        invitationId,
        inviteeMainDevice: inviteeUserAndDevice.mainDevice,
        invitationSigningKeyPairSeed:
          workspaceInvitationResult.invitationSigningKeyPairSeed,
        authorizationHeader: inviteeUserAndDevice.sessionKey,
        overwriteInvitationId: invitationId2,
      }))()
  ).rejects.toThrow();
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await acceptWorkspaceInvitation({
        graphql,
        invitationId,
        inviteeMainDevice: inviteeUserAndDevice.mainDevice,
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
  test("Invalid invitationId", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              invitationId: null,
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
