import { generateId } from "@serenity-tools/common";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getUnauthorizedDevicesForWorkspaces } from "../../../../test/helpers/device/getUnauthorizedDevicesForWorkspaces";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { getUnauthorizedMembers } from "../../../../test/helpers/workspace/getUnauthorizedMembers";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const username = `${generateId}@example.com`;
const password = "password";

let workspace1Id = "";
let userAndDevice: any = undefined;

const setup = async () => {
  userAndDevice = await createUserWithWorkspace({
    id: "workspace_id_1",
    username,
    password,
  });
  workspace1Id = userAndDevice.workspace.id;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("no devices members when workspace created", async () => {
  const result = await getUnauthorizedDevicesForWorkspaces({
    graphql,
    sessionKey: userAndDevice.sessionKey,
  });
  const unauthorizedMembers =
    result.unauthorizedDevicesForWorkspaces.unauthorizedMemberDevices;
  expect(unauthorizedMembers.length).toBe(0);
});

test("unauthorized devices when workspace added", async () => {
  const otherUserAndDevice = await createUserWithWorkspace({
    id: "workspace_id_2",
    username: `${generateId()}@example.com`,
    password,
  });
  const otherUserId = otherUserAndDevice.user.id;
  const otherSessionKey = otherUserAndDevice.sessionKey;
  const otherDevice = otherUserAndDevice.device;
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: workspace1Id,
    authorizationHeader: userAndDevice.sessionKey,
    mainDevice: userAndDevice.mainDevice,
  });
  const invitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  await acceptWorkspaceInvitation({
    graphql,
    invitationId,
    inviteeMainDevice: otherUserAndDevice.mainDevice,
    invitationSigningKeyPairSeed:
      workspaceInvitationResult.invitationSigningKeyPairSeed,
    authorizationHeader: otherUserAndDevice.sessionKey,
  });
  const result = await getUnauthorizedDevicesForWorkspaces({
    graphql,
    sessionKey: userAndDevice.sessionKey,
  });
  const unauthorizedMembers =
    result.unauthorizedDevicesForWorkspaces.unauthorizedMemberDevices;

  expect(unauthorizedMembers.length).toBe(1);
  const workspaceInfo = unauthorizedMembers[0];

  expect(workspaceInfo.id).toBe(workspace1Id);
  expect(workspaceInfo.members.length).toBe(1);

  const unauthorizedMember = workspaceInfo.members[0];
  expect(unauthorizedMember.id).toBe(otherUserId);
  expect(unauthorizedMember.devices.length).toBe(2);
  for (let unauthorizedDevice of unauthorizedMember.devices) {
    if (unauthorizedDevice.info === null) {
      expect(unauthorizedDevice.signingPublicKey).toBe(
        otherDevice.signingPublicKey
      );
      break;
    }
  }
  // TODO: test when user re-encodes workspace key boxes
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
