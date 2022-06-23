import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { getWorkspace } from "../../../database/workspace/getWorkspace";

const graphql = setupGraphql();

let userAndDevice2: any = null;

beforeAll(async () => {
  await deleteAllRecords();
});

test("user should be able to create an invitation", async () => {
  const workspaceId = "workspace1";
  const username = "jane2@example.com";
  const userAndDevice = await createUserWithWorkspace({
    id: workspaceId,
    username,
  });
  const workspace = await getWorkspace({
    id: workspaceId,
    userId: userAndDevice.user.id,
  });
  if (!workspace) {
    throw new Error("workspace not found");
  }
  const result = await createWorkspaceInvitation({
    graphql,
    workspaceId,
    authorizationHeader: userAndDevice.device.signingPublicKey,
  });
  const workspaceInvitation =
    result.createWorkspaceInvitation.workspaceInvitation;
  expect(typeof workspaceInvitation.id).toBe("string");
  expect(workspaceInvitation.workspaceId).toBe(workspaceId);
  expect(workspaceInvitation.inviterUserId).toBe(userAndDevice.user.id);
  expect(workspaceInvitation.expiresAt).toBeDefined();
});

test("user should not be able to invite from a workspace they don't own", async () => {
  const workspaceId1 = "workspace2";
  const workspaceId2 = "otherWorkspace";
  const username1 = "adam@example.com";
  const username2 = "betty@example.com";
  const userAndDevice1 = await createUserWithWorkspace({
    id: workspaceId1,
    username: username1,
  });
  userAndDevice2 = await createUserWithWorkspace({
    id: workspaceId2,
    username: username2,
  });
  await expect(
    (async () =>
      await createWorkspaceInvitation({
        graphql,
        workspaceId: workspaceId2,
        authorizationHeader: userAndDevice1.device.signingPublicKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("user should not be able to invite from a workspace that doesn't exist", async () => {
  const username = "adam@example.com";
  await expect(
    (async () =>
      await createWorkspaceInvitation({
        graphql,
        workspaceId: "nonexistantWorkspace",
        authorizationHeader: userAndDevice2.device.signingPublicKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});
