import {
  encryptWorkspaceKeyForDevice,
  generateId,
} from "@serenity-tools/common";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { attachDevicesToWorkspaces } from "../../../../test/helpers/device/attachDevicesToWorkspaces";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { getWorkspaceDevices } from "../../../../test/helpers/workspace/getWorkspaceDevices";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = null;
let userData2: any = null;
let numStartingDevices = 2;

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: generateId(),
    username: `${generateId()}@example.com`,
  });
  userData2 = await createUserWithWorkspace({
    id: generateId(),
    username: `${generateId()}@example.com`,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("One key on first run", async () => {
  const workspaceDevicesResult = await getWorkspaceDevices({
    graphql,
    workspaceId: userData1.workspace.id,
    authorizationHeader: userData1.sessionKey,
  });
  const devices = workspaceDevicesResult.workspaceDevices.nodes;
  expect(devices.length).toBe(numStartingDevices);
  let foundUser1Device = false;
  let foundUser1Device2 = false;
  for (let device of devices) {
    if (device.signingPublicKey === userData1.device.signingPublicKey) {
      foundUser1Device = true;
    } else if (
      device.signingPublicKey === userData1.webDevice.signingPublicKey
    ) {
      foundUser1Device2 = true;
    } else {
      throw new Error("Unexpected device found");
    }
  }
  expect(foundUser1Device).toBe(true);
  expect(foundUser1Device2).toBe(true);
});

// TODO: test after user joins workspace, and their device is added to the devices list

test("new user results in added device", async () => {
  const invitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: userData1.workspace.id,
    authorizationHeader: userData1.sessionKey,
    mainDevice: userData1.mainDevice,
  });
  const workspaceInvitationId =
    invitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  await acceptWorkspaceInvitation({
    graphql,
    workspaceInvitationId,
    inviteeUsername: userData2.user.username,
    inviteeMainDevice: userData2.mainDevice,
    invitationSigningKeyPairSeed: invitationResult.invitationSigningKeyPairSeed,
    authorizationHeader: userData2.sessionKey,
  });
  const workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspace: userData1.workspace,
  });
  const { ciphertext, nonce } = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData2.device.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKey,
  });
  const workspaceMemberDevices = [
    {
      id: userData1.workspace.id,
      workspaceKeysMembers: [
        {
          id: userData1.workspace.currentWorkspaceKey.id,
          members: [
            {
              id: userData2.user.id,
              workspaceDevices: [
                {
                  receiverDeviceSigningPublicKey:
                    userData2.device.signingPublicKey,
                  ciphertext,
                  nonce,
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  await attachDevicesToWorkspaces({
    graphql,
    creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
    workspaceMemberDevices,
    authorizationHeader: userData1.sessionKey,
  });
  const workspaceDevicesResult = await getWorkspaceDevices({
    graphql,
    workspaceId: userData1.workspace.id,
    authorizationHeader: userData1.sessionKey,
  });
  const devices = workspaceDevicesResult.workspaceDevices.nodes;
  expect(devices.length).toBe(numStartingDevices + 1);
  let foundUser1Device = false;
  let foundUser1Device2 = false;
  let foundUser2Device = false;
  for (let device of devices) {
    if (device.signingPublicKey === userData1.device.signingPublicKey) {
      foundUser1Device = true;
    } else if (
      device.signingPublicKey === userData1.webDevice.signingPublicKey
    ) {
      foundUser1Device2 = true;
    } else if (device.signingPublicKey === userData2.device.signingPublicKey) {
      foundUser2Device = true;
    } else {
      throw new Error("Unexpected device found");
    }
  }
  expect(foundUser1Device).toBe(true);
  expect(foundUser1Device2).toBe(true);
  expect(foundUser2Device).toBe(true);
});

test("not workspace member throw error", async () => {
  await expect(
    (async () =>
      await getWorkspaceDevices({
        graphql,
        workspaceId: userData2.workspace.id,
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("not logged in member throw error", async () => {
  await expect(
    (async () =>
      await getWorkspaceDevices({
        graphql,
        workspaceId: userData2.workspace.id,
        authorizationHeader: "",
      }))()
  ).rejects.toThrowError(/Not authenticated/);
});
