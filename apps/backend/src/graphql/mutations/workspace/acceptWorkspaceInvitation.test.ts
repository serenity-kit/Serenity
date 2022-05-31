import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { getWorkspace } from "../../../database/workspace/getWorkspace";
import { prisma } from "../../../database/prisma";

const graphql = setupGraphql();
const workspaceId = "workspace1";
const otherWorkspaceId = "workspace2";
let workspaceInvitationId = "";
let inviteeUsername = "invitee@example.com";

beforeAll(async () => {
  await deleteAllRecords();
});

test("user should be able to accept an invitation", async () => {
  const inviterUsername = "inviter@example.com";
  const inviterUser = await createUserWithWorkspace({
    id: workspaceId,
    username: inviterUsername,
  });
  const inviteeUser = await createUserWithWorkspace({
    id: otherWorkspaceId,
    username: inviteeUsername,
  });
  const workspace = await getWorkspace({
    id: workspaceId,
    userId: inviterUser.id,
  });
  if (!workspace) {
    throw new Error("workspace not found");
  }
  const createWorkspaceResult = await createWorkspaceInvitation({
    graphql,
    workspaceId,
    authorizationHeader: `TODO+${inviterUsername}`,
  });
  workspaceInvitationId =
    createWorkspaceResult.createWorkspaceInvitation.workspaceInvitation.id;
  const acceptedWorkspaceResult = await acceptWorkspaceInvitation({
    graphql,
    workspaceInvitationId,
    authorizationHeader: `TODO+${inviteeUsername}`,
  });
  const sharedWorkspace =
    acceptedWorkspaceResult.acceptWorkspaceInvitation.workspace;
  expect(typeof sharedWorkspace.id).toBe("string");
  expect(sharedWorkspace.name).toBe(sharedWorkspace.name);
  expect(sharedWorkspace.members.length).toBe(2);
  sharedWorkspace.members.forEach(
    (member: { username: string; isAdmin: any }) => {
      if (member.username === inviteeUsername) {
        expect(member.isAdmin).toBe(false);
      } else if (member.username === inviterUsername) {
        expect(member.isAdmin).toBe(true);
      }
    }
  );
});

test("double-accepting invitation does nothing", async () => {
  const acceptedWorkspaceResult = await acceptWorkspaceInvitation({
    graphql,
    workspaceInvitationId,
    authorizationHeader: `TODO+${inviteeUsername}`,
  });
  const sharedWorkspace =
    acceptedWorkspaceResult.acceptWorkspaceInvitation.workspace;
  expect(typeof sharedWorkspace.id).toBe("string");
  expect(sharedWorkspace.name).toBe(sharedWorkspace.name);
  expect(sharedWorkspace.members.length).toBe(2);
  sharedWorkspace.members.forEach(
    (member: { userId: string; isAdmin: any }) => {
      if (member.userId === inviteeUsername) {
        expect(member.isAdmin).toBe(false);
      }
    }
  );
});

test("invalid invitation id should throw error", async () => {
  await expect(
    (async () =>
      await acceptWorkspaceInvitation({
        graphql,
        workspaceInvitationId: "invalid",
        authorizationHeader: `TODO+${inviteeUsername}`,
      }))()
  ).rejects.toThrow("Workspace invitation not found");
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
  await expect(
    (async () =>
      await acceptWorkspaceInvitation({
        graphql,
        workspaceInvitationId: "invalid",
        authorizationHeader: `TODO+${inviteeUsername}`,
      }))()
  ).rejects.toThrow("Workspace invitation not found");
});
