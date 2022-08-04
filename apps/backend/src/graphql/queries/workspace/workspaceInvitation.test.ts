import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { workspaceInvitations } from "../../../../test/helpers/workspace/workspaceInvitations";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { getWorkspace } from "../../../database/workspace/getWorkspace";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { prisma } from "../../../database/prisma";
import { v4 as uuidv4 } from "uuid";

const graphql = setupGraphql();
const workspaceId = "workspace1";
const otherWorkspaceId = "otherWorkspace";
const inviter1Username = "inviter1@example.com";
const inviter2Username = "inviter2@example.com";

const setup = async () => {};

beforeAll(async () => {
  await deleteAllRecords();
});

test("should return a list of workspace invitations if they are admin", async () => {
  const inviterUserAndDevice1 = await createUserWithWorkspace({
    id: workspaceId,
    username: inviter1Username,
  });
  const device = inviterUserAndDevice1.device;
  const inviterUserAndDevice2 = await createUserWithWorkspace({
    id: otherWorkspaceId,
    username: inviter2Username,
  });
  const workspace = await getWorkspace({
    id: workspaceId,
    userId: inviterUserAndDevice1.user.id,
    deviceSigningPublicKey: device.signingPublicKey,
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

test("should throw an error if we try to fetch more than 50", async () => {
  const otherWorkspaceId2 = "otherWorkspace44";
  const username = "newuser44@example.com";
  const userAndDevice = await createUserWithWorkspace({
    id: otherWorkspaceId2,
    username: username,
  });
  await expect(
    (async () =>
      await workspaceInvitations({
        graphql,
        workspaceId,
        authorizationHeader: userAndDevice.sessionKey,
        first: 51,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
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
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("not logged in user should throw an authentication error", async () => {
  const username = "newuserd87509bb502f@example.com";
  const userAndDevice = await createUserWithWorkspace({
    id: "25364d28-0883-42d4-872c-d87509bb502f",
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
        authorizationHeader: "abc",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

let userAndDevice: any = null;
describe("Input errors", () => {
  beforeAll(async () => {
    const workspaceId = uuidv4();
    const username = `${uuidv4()}@example.com`;
    userAndDevice = await createUserWithWorkspace({
      id: workspaceId,
      username: username,
    });
  });
  test("Invalid workspaceId", async () => {
    await expect(
      (async () =>
        await workspaceInvitations({
          graphql,
          workspaceId: "",
          authorizationHeader: userAndDevice.sessionKey,
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
