import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { workspaceInvitations } from "../../../../test/helpers/workspace/workspaceInvitations";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { getWorkspace } from "../../../database/workspace/getWorkspace";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { prisma } from "../../../database/prisma";

const graphql = setupGraphql();
const workspaceId = "workspace1";
const otherWorkspaceId = "otherWorkspace";
const inviter1Username = "inviter1@example.com";
const inviter2Username = "inviter2@example.com";

beforeAll(async () => {
  await deleteAllRecords();
});

test("should return a list of workspace invitations if they are admin", async () => {
  const inviterUserAndDevice1 = await createUserWithWorkspace({
    id: workspaceId,
    username: inviter1Username,
  });
  const inviterUserAndDevice2 = await createUserWithWorkspace({
    id: otherWorkspaceId,
    username: inviter2Username,
  });
  const workspace = await getWorkspace({
    id: workspaceId,
    userId: inviterUserAndDevice1.user.id,
  });
  if (!workspace) {
    throw new Error("workspace not found");
  }
  await createWorkspaceInvitation({
    graphql,
    workspaceId,
    authorizationHeader: inviterUserAndDevice1.sessionKey,
  });
  // add user2 as an admin
  await prisma.usersToWorkspaces.create({
    data: {
      user: {
        connect: {
          username: inviter2Username,
        },
      },
      workspace: {
        connect: {
          id: workspaceId,
        },
      },
      isAdmin: true,
    },
  });
  await createWorkspaceInvitation({
    graphql,
    workspaceId,
    authorizationHeader: inviterUserAndDevice2.sessionKey,
  });
  const workspaceInvitationsResult = await workspaceInvitations({
    graphql,
    workspaceId,
    authorizationHeader: inviterUserAndDevice1.sessionKey,
  });
  const invitations = workspaceInvitationsResult.workspaceInvitations.edges;
  expect(invitations.length).toBe(2);
});

test("not admin should throw error", async () => {
  // add user2 as an non-admin
  const otherWorkspaceId2 = "otherWorkspace2";
  const username = "newuser@example.com";
  const userAndDevice = await createUserWithWorkspace({
    id: otherWorkspaceId2,
    username: username,
  });
  await prisma.usersToWorkspaces.create({
    data: {
      user: {
        connect: {
          username: username,
        },
      },
      workspace: {
        connect: {
          id: workspaceId,
        },
      },
      isAdmin: false,
    },
  });
  await expect(
    (async () =>
      await workspaceInvitations({
        graphql,
        workspaceId,
        authorizationHeader: userAndDevice.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});
