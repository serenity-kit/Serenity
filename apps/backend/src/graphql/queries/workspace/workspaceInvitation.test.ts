import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { workspaceInvitations } from "../../../../test/helpers/workspace/workspaceInvitations";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { getWorkspace } from "../../../database/workspace/getWorkspace";

const graphql = setupGraphql();
let workspaceId = "";
const inviter1Username = "inviter1@example.com";
const inviter2Username = "inviter2@example.com";

beforeAll(async () => {
  await deleteAllRecords();
});

test("should return a list of workspace invitations if they are admin", async () => {
  const inviterUserAndDevice1 = await createUserWithWorkspace({
    username: inviter1Username,
  });
  const device = inviterUserAndDevice1.device;
  workspaceId = inviterUserAndDevice1.workspace.id;
  const inviterUserAndDevice2 = await createUserWithWorkspace({
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
    role: Role.ADMIN,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: inviterUserAndDevice1.sessionKey,
    }).authorization,
    mainDevice: inviterUserAndDevice1.mainDevice,
  });
  await createWorkspaceInvitation({
    graphql,
    workspaceId,
    role: Role.EDITOR,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: inviterUserAndDevice1.sessionKey,
    }).authorization,
    mainDevice: inviterUserAndDevice1.mainDevice,
  });
  const workspaceInvitationsResult = await workspaceInvitations({
    graphql,
    workspaceId,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: inviterUserAndDevice1.sessionKey,
    }).authorization,
  });
  const invitations = workspaceInvitationsResult.workspaceInvitations.edges;
  expect(invitations.length).toBe(2);
});

test("should throw an error if we try to fetch more than 50", async () => {
  const username = "newuser44@example.com";
  const userAndDevice = await createUserWithWorkspace({
    username: username,
  });
  await expect(
    (async () =>
      await workspaceInvitations({
        graphql,
        workspaceId,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userAndDevice.sessionKey,
        }).authorization,
        first: 51,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("not admin should throw error", async () => {
  // add user2 as an non-admin
  const username = "newuser@example.com";
  const userAndDevice = await createUserWithWorkspace({
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
      role: Role.EDITOR,
    },
  });
  await expect(
    (async () =>
      await workspaceInvitations({
        graphql,
        workspaceId,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userAndDevice.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("not logged in user should throw an authentication error", async () => {
  const username = "newuserd87509bb502f@example.com";
  const userAndDevice = await createUserWithWorkspace({
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
      role: Role.EDITOR,
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
    const workspaceId = generateId();
    const username = `${generateId()}@example.com`;
    userAndDevice = await createUserWithWorkspace({
      username: username,
    });
  });
  test("Invalid workspaceId", async () => {
    await expect(
      (async () =>
        await workspaceInvitations({
          graphql,
          workspaceId: "",
          authorizationHeader: deriveSessionAuthorization({
            sessionKey: userAndDevice.sessionKey,
          }).authorization,
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
