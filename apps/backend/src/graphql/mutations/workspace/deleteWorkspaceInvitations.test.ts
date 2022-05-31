import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createWorkspace } from "../../../../test/helpers/workspace/createWorkspace";
import { deleteWorkspaces } from "../../../../test/helpers/workspace/deleteWorkspaces";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { deleteWorkspaceInvitations } from "../../../../test/helpers/workspace/deleteWorkspaceInvitations";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { prisma } from "../../../database/prisma";

const graphql = setupGraphql();
const username1 = "user1";
const username2 = "user2";
const workspace1 = "workspace1";
const workspace2 = "workspace2";

const initializeData = async () => {
  const user1 = await createUserWithWorkspace({
    id: workspace1,
    username: username1,
  });
  const user2 = await createUserWithWorkspace({
    id: workspace2,
    username: username2,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await initializeData();
});

test("user should be able to delete a workspace invitation they created", async () => {
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    workspaceId: workspace1,
    authorizationHeader: `TODO+${username1}`,
  });
  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  const workspaceInvitationIds: string[] = [workspaceInvitationId];
  const deleteWorkspaceInvitationResult = await deleteWorkspaceInvitations({
    graphql,
    ids: workspaceInvitationIds,
    authorizationHeader: `TODO+${username1}`,
  });
  expect(deleteWorkspaceInvitationResult.deleteWorkspaceInvitations)
    .toMatchInlineSnapshot(`
    Object {
      "status": "success",
    }
  `);
});

test("user should be able to delete a workspace invitation they didn't create", async () => {
  // add user2 as an admin for workspace 1
  await prisma.usersToWorkspaces.create({
    data: {
      user: {
        connect: {
          username: username2,
        },
      },
      workspace: {
        connect: {
          id: workspace1,
        },
      },
      isAdmin: true,
    },
  });
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    workspaceId: workspace1,
    authorizationHeader: `TODO+${username2}`,
  });
  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  const workspaceInvitationIds: string[] = [workspaceInvitationId];
  const deleteWorkspaceInvitationResult = await deleteWorkspaceInvitations({
    graphql,
    ids: workspaceInvitationIds,
    authorizationHeader: `TODO+${username1}`,
  });
  expect(deleteWorkspaceInvitationResult.deleteWorkspaceInvitations)
    .toMatchInlineSnapshot(`
    Object {
      "status": "success",
    }
  `);
});

test("user should not be able to delete a workspace invitation if they aren't admin", async () => {
  // add user1 to workspace2
  await prisma.usersToWorkspaces.create({
    data: {
      user: {
        connect: {
          username: username1,
        },
      },
      workspace: {
        connect: {
          id: workspace2,
        },
      },
      isAdmin: false,
    },
  });
  // user2 shares workspace
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    workspaceId: workspace2,
    authorizationHeader: `TODO+${username2}`,
  });
  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  const workspaceInvitationIds: string[] = [workspaceInvitationId];
  const deleteWorkspaceInvitationResult = await deleteWorkspaceInvitations({
    graphql,
    ids: workspaceInvitationIds,
    authorizationHeader: `TODO+${username1}`,
  });
  expect(deleteWorkspaceInvitationResult.deleteWorkspaceInvitations)
    .toMatchInlineSnapshot(`
    Object {
      "status": "success",
    }
  `);
});
