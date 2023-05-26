import { generateId } from "@serenity-tools/common";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { getUnauthorizedMembers } from "../../../../test/helpers/workspace/getUnauthorizedMembers";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const password = "password";

let workspace1Id = "";
let userAndDevice: any = null;

beforeAll(async () => {
  await deleteAllRecords();

  userAndDevice = await createUserWithWorkspace({
    id: generateId(),
    username,
    password,
  });
  workspace1Id = userAndDevice.workspace.id;
});

test("no unauthorized members when workspace created", async () => {
  const result = await getUnauthorizedMembers({
    graphql,
    input: { workspaceIds: [workspace1Id] },
    sessionKey: userAndDevice.sessionKey,
  });
  expect(result.unauthorizedMembers.userIds.length).toBe(0);
});

test("unauthorized members when workspace added", async () => {
  const otherUserAndDevice = await createUserWithWorkspace({
    id: generateId(),
    username: `${generateId()}@example.com`,
    password,
  });
  const otherUserId = otherUserAndDevice.user.id;
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: workspace1Id,
    authorizationHeader: userAndDevice.sessionKey,
    mainDevice: userAndDevice.mainDevice,
  });
  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;

  await acceptWorkspaceInvitation({
    graphql,
    workspaceInvitationId,
    inviteeUsername: otherUserAndDevice.user.username,
    inviteeMainDevice: otherUserAndDevice.mainDevice,
    invitationSigningKeyPairSeed:
      workspaceInvitationResult.invitationSigningKeyPairSeed,
    authorizationHeader: otherUserAndDevice.sessionKey,
  });
  const result = await getUnauthorizedMembers({
    graphql,
    input: { workspaceIds: [workspace1Id] },
    sessionKey: userAndDevice.sessionKey,
  });
  expect(result.unauthorizedMembers.userIds.length).toBe(1);
  expect(result.unauthorizedMembers.userIds[0]).toBe(otherUserId);
  // TODO: test when user1 accepts workspaceInvitation
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getUnauthorizedMembers({
        graphql,
        input: { workspaceIds: [workspace1Id] },
        sessionKey: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
