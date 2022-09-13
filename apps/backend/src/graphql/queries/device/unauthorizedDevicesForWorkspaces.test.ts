import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getUnauthorizedDevicesForWorkspaces } from "../../../../test/helpers/device/getUnauthorizedDevicesForWorkspaces";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { getUnauthorizedMembers } from "../../../../test/helpers/workspace/getUnauthorizedMembers";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { acceptWorkspaceInvitation } from "../../../database/workspace/acceptWorkspaceInvitation";

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
    workspaceId: workspace1Id,
    authorizationHeader: sessionKey,
  });
  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  await acceptWorkspaceInvitation({
    workspaceInvitationId,
    userId: otherUserId,
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
