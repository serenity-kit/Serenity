import {
  encryptWorkspaceKeyForDevice,
  generateId,
} from "@serenity-tools/common";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { authorizeMember } from "../../../../test/helpers/workspace/authorizeMember";
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
  const invitationId =
    invitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  await acceptWorkspaceInvitation({
    graphql,
    invitationId,
    inviteeMainDevice: userData2.mainDevice,
    invitationSigningKeyPairSeed: invitationResult.invitationSigningKeyPairSeed,
    authorizationHeader: userData2.sessionKey,
  });
  const workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspace: userData1.workspace,
  });

  const userData2DeviceWorkspaceKeyBox = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData2.webDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKey,
  });
  const userData2MainDeviceWorkspaceKeyBox = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData2.mainDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKey,
  });

  const workspaceKeys = [
    {
      workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
      workspaceKeyBoxes: [
        {
          ciphertext: userData2DeviceWorkspaceKeyBox.ciphertext,
          nonce: userData2DeviceWorkspaceKeyBox.nonce,
          receiverDeviceSigningPublicKey: userData2.webDevice.signingPublicKey,
        },
        {
          ciphertext: userData2MainDeviceWorkspaceKeyBox.ciphertext,
          nonce: userData2MainDeviceWorkspaceKeyBox.nonce,
          receiverDeviceSigningPublicKey: userData2.mainDevice.signingPublicKey,
        },
      ],
    },
  ];

  await authorizeMember({
    graphql,
    workspaceId: userData1.workspace.id,
    creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
    workspaceKeys,
    authorizationHeader: userData1.sessionKey,
  });

  const workspaceDevicesResult = await getWorkspaceDevices({
    graphql,
    workspaceId: userData1.workspace.id,
    authorizationHeader: userData1.sessionKey,
  });
  const devices = workspaceDevicesResult.workspaceDevices.nodes;

  expect(devices.length).toBe(numStartingDevices + 2);

  const deviceSigningPublicKeys = devices.map(
    (device) => device.signingPublicKey
  );
  expect(deviceSigningPublicKeys).toContain(
    userData2.webDevice.signingPublicKey
  );
  expect(deviceSigningPublicKeys).toContain(
    userData2.mainDevice.signingPublicKey
  );
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
