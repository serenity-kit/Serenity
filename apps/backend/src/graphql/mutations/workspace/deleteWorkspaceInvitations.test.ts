import { gql } from "graphql-request";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { deleteWorkspaceInvitations } from "../../../../test/helpers/workspace/deleteWorkspaceInvitations";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const username1 = "user1";
const username2 = "user2";
let userAndDevice1: any = null;
let userAndDevice2: any = null;

beforeAll(async () => {
  await deleteAllRecords();
  userAndDevice1 = await createUserWithWorkspace({
    username: username1,
  });
  userAndDevice2 = await createUserWithWorkspace({
    username: username2,
  });
});

test("user should be able to delete a workspace invitation they created", async () => {
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: userAndDevice1.workspace.id,
    authorizationHeader: userAndDevice1.sessionKey,
    mainDevice: userAndDevice1.mainDevice,
  });
  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  const workspaceInvitationIds: string[] = [workspaceInvitationId];
  const deleteWorkspaceInvitationResult = await deleteWorkspaceInvitations({
    graphql,
    ids: workspaceInvitationIds,
    authorizationHeader: userAndDevice1.sessionKey,
  });
  expect(deleteWorkspaceInvitationResult.deleteWorkspaceInvitations)
    .toMatchInlineSnapshot(`
    {
      "status": "success",
    }
  `);
});

test("user should be able to delete a workspace invitation they didn't create", async () => {
  // add user2 as an admin for workspace 1
  // TODO should be an actual GraphQL call with a chain update
  await prisma.usersToWorkspaces.create({
    data: {
      user: {
        connect: {
          username: username2,
        },
      },
      workspace: {
        connect: {
          id: userAndDevice1.workspace.id,
        },
      },
      role: Role.ADMIN,
    },
  });
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: userAndDevice1.workspace.id,
    authorizationHeader: userAndDevice2.sessionKey,
    mainDevice: userAndDevice2.mainDevice,
  });
  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  const workspaceInvitationIds: string[] = [workspaceInvitationId];
  const deleteWorkspaceInvitationResult = await deleteWorkspaceInvitations({
    graphql,
    ids: workspaceInvitationIds,
    authorizationHeader: userAndDevice1.sessionKey,
  });
  expect(deleteWorkspaceInvitationResult.deleteWorkspaceInvitations)
    .toMatchInlineSnapshot(`
    {
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
          id: userAndDevice2.workspace.id,
        },
      },
      role: Role.EDITOR,
    },
  });
  // user2 shares workspace
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: userAndDevice2.workspace.id,
    authorizationHeader: userAndDevice2.sessionKey,
    mainDevice: userAndDevice2.mainDevice,
  });
  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  const workspaceInvitationIds: string[] = [workspaceInvitationId];
  const deleteWorkspaceInvitationResult = await deleteWorkspaceInvitations({
    graphql,
    ids: workspaceInvitationIds,
    authorizationHeader: userAndDevice1.sessionKey,
  });
  expect(deleteWorkspaceInvitationResult.deleteWorkspaceInvitations)
    .toMatchInlineSnapshot(`
    {
      "status": "success",
    }
  `);
});

test("Unauthenticated", async () => {
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: userAndDevice1.workspace.id,
    authorizationHeader: userAndDevice1.sessionKey,
    mainDevice: userAndDevice1.mainDevice,
  });
  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  const workspaceInvitationIds: string[] = [workspaceInvitationId];
  await expect(
    (async () =>
      await deleteWorkspaceInvitations({
        graphql,
        ids: workspaceInvitationIds,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input Errors", () => {
  const query = gql`
    mutation deleteWorkspaceInvitations(
      $input: DeleteWorkspaceInvitationsInput
    ) {
      deleteWorkspaceInvitations(input: $input) {
        status
      }
    }
  `;
  test("Invalid id", async () => {
    const authorizationHeaders = {
      authorization: userAndDevice1.sessionKey,
    };
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          { input: { ids: null } },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });
  test("Invalid input", async () => {
    const authorizationHeaders = {
      authorization: userAndDevice1.sessionKey,
    };
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          { input: null },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });
  test("No input", async () => {
    const authorizationHeaders = {
      authorization: userAndDevice1.sessionKey,
    };
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });
});
