import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
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
let invitationId = "";
let workspaceId = "";
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
  const role = Role.ADMIN;
  inviterUserAndDevice = await createUserWithWorkspace({
    username: inviterUsername,
  });
  workspaceId = inviterUserAndDevice.workspace.id;
  const device = inviterUserAndDevice.device;
  inviteeUserAndDevice = await createUserWithWorkspace({
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
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: inviterUserAndDevice.sessionKey,
    }).authorization,
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
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: inviteeUserAndDevice.sessionKey,
    }).authorization,
  });

  expect(acceptedWorkspaceResult.acceptWorkspaceInvitation.workspaceId).toBe(
    workspaceId
  );

  const workspaceMembers = await prisma.usersToWorkspaces.findMany({
    where: { workspaceId },
  });
  expect(workspaceMembers.length).toBe(2);
});

test("double-accepting invitation throws an error", async () => {
  await expect(
    (async () =>
      await acceptWorkspaceInvitation({
        graphql,
        invitationId,
        inviteeMainDevice: inviteeUserAndDevice.mainDevice,
        invitationSigningKeyPairSeed:
          workspaceInvitationResult.invitationSigningKeyPairSeed,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: inviteeUserAndDevice.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrow();
});

test("accept editor role", async () => {
  const inviterUsername = `invite-${generateId()}@example.com`;
  const inviteeUsername = `invitee-${generateId()}@example.com`;
  const role = Role.EDITOR;
  inviterUserAndDevice = await createUserWithWorkspace({
    username: inviterUsername,
  });
  workspaceId = inviterUserAndDevice.workspace.id;
  const device = inviterUserAndDevice.device;
  inviteeUserAndDevice = await createUserWithWorkspace({
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
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: inviterUserAndDevice.sessionKey,
    }).authorization,
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
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: inviteeUserAndDevice.sessionKey,
    }).authorization,
  });

  expect(acceptedWorkspaceResult.acceptWorkspaceInvitation.workspaceId).toBe(
    workspaceId
  );

  const workspaceMembers = await prisma.usersToWorkspaces.findMany({
    where: { workspaceId },
  });
  expect(workspaceMembers.length).toBe(2);
});

test("accept commenter role", async () => {
  const inviterUsername = `invite-${generateId()}@example.com`;
  const inviteeUsername = `invitee-${generateId()}@example.com`;
  const role = Role.COMMENTER;
  inviterUserAndDevice = await createUserWithWorkspace({
    username: inviterUsername,
  });
  workspaceId = inviterUserAndDevice.workspace.id;
  const device = inviterUserAndDevice.device;
  inviteeUserAndDevice = await createUserWithWorkspace({
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
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: inviterUserAndDevice.sessionKey,
    }).authorization,
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
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: inviteeUserAndDevice.sessionKey,
    }).authorization,
  });

  expect(acceptedWorkspaceResult.acceptWorkspaceInvitation.workspaceId).toBe(
    workspaceId
  );

  const workspaceMembers = await prisma.usersToWorkspaces.findMany({
    where: { workspaceId },
  });
  expect(workspaceMembers.length).toBe(2);
});

test("accept viewer role", async () => {
  const inviterUsername = `invite-${generateId()}@example.com`;
  const inviteeUsername = `invitee-${generateId()}@example.com`;
  const role = Role.VIEWER;
  inviterUserAndDevice = await createUserWithWorkspace({
    username: inviterUsername,
  });
  workspaceId = inviterUserAndDevice.workspace.id;
  const device = inviterUserAndDevice.device;
  inviteeUserAndDevice = await createUserWithWorkspace({
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
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: inviterUserAndDevice.sessionKey,
    }).authorization,
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
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: inviteeUserAndDevice.sessionKey,
    }).authorization,
  });

  expect(acceptedWorkspaceResult.acceptWorkspaceInvitation.workspaceId).toBe(
    workspaceId
  );

  const workspaceMembers = await prisma.usersToWorkspaces.findMany({
    where: { workspaceId },
  });
  expect(workspaceMembers.length).toBe(2);
});

test("invalid invitation id should throw error", async () => {
  const workspaceInvitationResult2 = await createWorkspaceInvitation({
    graphql,
    role: Role.ADMIN,
    workspaceId,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: inviterUserAndDevice.sessionKey,
    }).authorization,
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
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: inviteeUserAndDevice.sessionKey,
        }).authorization,
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
        workspaceId
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
