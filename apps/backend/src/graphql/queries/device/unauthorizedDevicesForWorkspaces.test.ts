import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getUnauthorizedDevicesForWorkspaces } from "../../../../test/helpers/device/getUnauthorizedDevicesForWorkspaces";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { getUnauthorizedMembers } from "../../../../test/helpers/workspace/getUnauthorizedMembers";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const username = `${uuidv4}@example.com`;
const password = "password";

let sessionKey = "";
let workspace1Id = "";

const setup = async () => {
  const userAndDevice = await createUserWithWorkspace({
    id: "workspace_id_1",
    username,
    password,
  });
  sessionKey = userAndDevice.sessionKey;
  workspace1Id = userAndDevice.workspace.id;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("no devices members when workspace created", async () => {
  const result = await getUnauthorizedDevicesForWorkspaces({
    graphql,
    sessionKey,
  });
  const unauthorizedMembers =
    result.unauthorizedDevicesForWorkspaces.unauthorizedMemberDevices;
  expect(unauthorizedMembers.length).toBe(0);
});

test("unauthorized devices when workspace added", async () => {
  const otherUserAndDevice = await createUserWithWorkspace({
    id: "workspace_id_2",
    username: `${uuidv4()}@example.com`,
    password,
  });
  const otherUserId = otherUserAndDevice.user.id;
  const otherSessionKey = otherUserAndDevice.sessionKey;
  const otherDevice = otherUserAndDevice.device;
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: workspace1Id,
    authorizationHeader: sessionKey,
  });
  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  await acceptWorkspaceInvitation({
    graphql,
    workspaceInvitationId,
    inviteeUsername: otherUserAndDevice.user.username,
    inviteeMainDevice: otherUserAndDevice.mainDevice,
    invitationSigningPrivateKey:
      workspaceInvitationResult.invitationSigningPrivateKey,
    authorizationHeader: otherUserAndDevice.sessionKey,
  });
  const result = await getUnauthorizedDevicesForWorkspaces({
    graphql,
    sessionKey,
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
