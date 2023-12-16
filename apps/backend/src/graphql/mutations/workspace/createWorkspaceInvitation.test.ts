import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { getWorkspace } from "../../../database/workspace/getWorkspace";

const graphql = setupGraphql();

let userAndDevice2: any = null;

beforeAll(async () => {
  await deleteAllRecords();
});

test("Invite admin", async () => {
  const username = `${generateId()}@example.com`;
  const role = Role.ADMIN;
  const userAndDevice = await createUserWithWorkspace({
    username,
  });
  const device = userAndDevice.device;
  const workspace = await getWorkspace({
    id: userAndDevice.workspace.id,
    userId: userAndDevice.user.id,
    deviceSigningPublicKey: device.signingPublicKey,
  });
  if (!workspace) {
    throw new Error("workspace not found");
  }
  const result = await createWorkspaceInvitation({
    graphql,
    role,
    workspaceId: userAndDevice.workspace.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userAndDevice.sessionKey,
    }).authorization,
    mainDevice: userAndDevice.mainDevice,
  });
  const workspaceInvitation =
    result.createWorkspaceInvitation.workspaceInvitation;
  expect(typeof workspaceInvitation.id).toBe("string");
  expect(workspaceInvitation.workspaceId).toBe(userAndDevice.workspace.id);
  expect(workspaceInvitation.inviterUserId).toBe(userAndDevice.user.id);
  expect(workspaceInvitation.role).toBe(role);
  expect(workspaceInvitation.expiresAt).toBeDefined();
});

test("invite editor", async () => {
  const username = `${generateId()}@example.com`;
  const role = Role.EDITOR;
  const userAndDevice = await createUserWithWorkspace({
    username,
  });
  const device = userAndDevice.device;
  const workspace = await getWorkspace({
    id: userAndDevice.workspace.id,
    userId: userAndDevice.user.id,
    deviceSigningPublicKey: device.signingPublicKey,
  });
  if (!workspace) {
    throw new Error("workspace not found");
  }
  const result = await createWorkspaceInvitation({
    graphql,
    role,
    workspaceId: userAndDevice.workspace.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userAndDevice.sessionKey,
    }).authorization,
    mainDevice: userAndDevice.mainDevice,
  });
  const workspaceInvitation =
    result.createWorkspaceInvitation.workspaceInvitation;
  expect(typeof workspaceInvitation.id).toBe("string");
  expect(workspaceInvitation.workspaceId).toBe(userAndDevice.workspace.id);
  expect(workspaceInvitation.inviterUserId).toBe(userAndDevice.user.id);
  expect(workspaceInvitation.role).toBe(role);
  expect(workspaceInvitation.expiresAt).toBeDefined();
});

test("invite commenter", async () => {
  const username = `${generateId()}@example.com`;
  const role = Role.COMMENTER;
  const userAndDevice = await createUserWithWorkspace({
    username,
  });
  const device = userAndDevice.device;
  const workspace = await getWorkspace({
    id: userAndDevice.workspace.id,
    userId: userAndDevice.user.id,
    deviceSigningPublicKey: device.signingPublicKey,
  });
  if (!workspace) {
    throw new Error("workspace not found");
  }
  const result = await createWorkspaceInvitation({
    graphql,
    role,
    workspaceId: userAndDevice.workspace.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userAndDevice.sessionKey,
    }).authorization,
    mainDevice: userAndDevice.mainDevice,
  });
  const workspaceInvitation =
    result.createWorkspaceInvitation.workspaceInvitation;
  expect(typeof workspaceInvitation.id).toBe("string");
  expect(workspaceInvitation.workspaceId).toBe(userAndDevice.workspace.id);
  expect(workspaceInvitation.inviterUserId).toBe(userAndDevice.user.id);
  expect(workspaceInvitation.role).toBe(role);
  expect(workspaceInvitation.expiresAt).toBeDefined();
});

test("invite viewer", async () => {
  const username = `${generateId()}@example.com`;
  const role = Role.VIEWER;
  const userAndDevice = await createUserWithWorkspace({
    username,
  });
  const device = userAndDevice.device;
  const workspace = await getWorkspace({
    id: userAndDevice.workspace.id,
    userId: userAndDevice.user.id,
    deviceSigningPublicKey: device.signingPublicKey,
  });
  if (!workspace) {
    throw new Error("workspace not found");
  }
  const result = await createWorkspaceInvitation({
    graphql,
    role,
    workspaceId: userAndDevice.workspace.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userAndDevice.sessionKey,
    }).authorization,
    mainDevice: userAndDevice.mainDevice,
  });
  const workspaceInvitation =
    result.createWorkspaceInvitation.workspaceInvitation;
  expect(typeof workspaceInvitation.id).toBe("string");
  expect(workspaceInvitation.workspaceId).toBe(userAndDevice.workspace.id);
  expect(workspaceInvitation.inviterUserId).toBe(userAndDevice.user.id);
  expect(workspaceInvitation.role).toBe(role);
  expect(workspaceInvitation.expiresAt).toBeDefined();
});

test("fail on unknown role", async () => {
  const username = `${generateId()}@example.com`;
  const userAndDevice = await createUserWithWorkspace({
    username: username,
  });
  await expect(
    (async () =>
      await createWorkspaceInvitation({
        graphql,
        workspaceId: userAndDevice.workspace.id,
        //@ts-expect-error: bad role type
        role: "bad-role",
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userAndDevice.sessionKey,
        }).authorization,
        mainDevice: userAndDevice.mainDevice,
      }))()
  ).rejects.toThrow();
});

test("user should not be able to invite from a workspace they don't own", async () => {
  const username1 = "adam@example.com";
  const username2 = "betty@example.com";
  const userAndDevice1 = await createUserWithWorkspace({
    username: username1,
  });
  userAndDevice2 = await createUserWithWorkspace({
    username: username2,
  });
  await expect(
    (async () =>
      await createWorkspaceInvitation({
        graphql,
        workspaceId: userAndDevice2.workspace.id,
        role: Role.EDITOR,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userAndDevice1.sessionKey,
        }).authorization,
        mainDevice: userAndDevice1.mainDevice,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  const username = "a@a.com";
  const userAndDevice = await createUserWithWorkspace({
    username: username,
  });
  await expect(
    (async () =>
      await createWorkspaceInvitation({
        graphql,
        workspaceId: userAndDevice.workspace.id,
        role: Role.EDITOR,
        authorizationHeader: "badauthheader",
        mainDevice: userAndDevice.mainDevice,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

test("Input Error", async () => {
  const authorizationHeaders = {
    authorization: userAndDevice2.sessionKey,
  };
  const query1 = gql`
    mutation {
      createWorkspaceInvitation(input: null) {
        workspaceInvitation {
          id
          workspaceId
          inviterUserId
          role
          expiresAt
        }
      }
    }
  `;
  await expect(
    (async () =>
      await graphql.client.request<any>(
        query1,
        undefined,
        authorizationHeaders
      ))()
  ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
});
