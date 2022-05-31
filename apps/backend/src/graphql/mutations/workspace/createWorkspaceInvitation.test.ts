import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createWorkspace } from "../../../../test/helpers/workspace/createWorkspace";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { getWorkspace } from "../../../database/workspace/getWorkspace";

const graphql = setupGraphql();

beforeAll(async () => {
  await deleteAllRecords();
});

test("user should be able to create an invitation", async () => {
  const workspaceId = "workspace1";
  const username = "jane2@example.com";
  const user = await createUserWithWorkspace({ id: workspaceId, username });
  const workspace = await getWorkspace({
    id: workspaceId,
    userId: user.id,
  });
  if (!workspace) {
    throw new Error("workspace not found");
  }
  const result = await createWorkspaceInvitation({
    graphql,
    workspaceId,
    authorizationHeader: `TODO+${username}`,
  });
  const workspaceInvitation =
    result.createWorkspaceInvitation.workspaceInvitation;
  expect(typeof workspaceInvitation.id).toBe("string");
  expect(workspaceInvitation.workspaceId).toBe(workspaceId);
  expect(workspaceInvitation.inviterUserId).toBe(user.id);
  expect(workspaceInvitation.expiresAt).toBeDefined();
});

test("user should not be able to invite from a workspace they don't own", async () => {
  const workspaceId1 = "workspace2";
  const workspaceId2 = "otherWorkspace";
  const username1 = "adam@example.com";
  const username2 = "betty@example.com";
  const user1 = await createUserWithWorkspace({
    id: workspaceId1,
    username: username1,
  });
  const user2 = await createUserWithWorkspace({
    id: workspaceId2,
    username: username2,
  });
  await expect(
    (async () =>
      await createWorkspaceInvitation({
        graphql,
        workspaceId: workspaceId2,
        authorizationHeader: `TODO+${username1}`,
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
        authorizationHeader: `TODO+${username}`,
      }))()
  ).rejects.toThrow("Unauthorized");
});
