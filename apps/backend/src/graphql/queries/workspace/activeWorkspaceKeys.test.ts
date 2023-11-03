import {
  createAndEncryptWorkspaceKeyForDevice,
  encryptWorkspaceKeyForDevice,
  generateId,
} from "@serenity-tools/common";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { attachDeviceToWorkspaces } from "../../../../test/helpers/device/attachDeviceToWorkspaces";
import { deleteDevice } from "../../../../test/helpers/device/deleteDevice";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { getActiveWorkspaceKeys } from "../../../../test/helpers/workspace/getActiveWorkspaceKeys";
import { prisma } from "../../../database/prisma";
import { createDeviceAndLogin } from "../../../database/testHelpers/createDeviceAndLogin";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { WorkspaceWithWorkspaceDevicesParing } from "../../../types/workspaceDevice";

const graphql = setupGraphql();
const username = `${generateId()}@example.com`;
const password = "password22room5K42";

let userData1: any = undefined;
let user1Device2: any = undefined;

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username,
    password,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("initial condition", async () => {
  const result = await getActiveWorkspaceKeys({
    graphql,
    workspaceId: userData1.workspace.id,
    deviceSigningPublicKey: userData1.device.signingPublicKey,
    sessionKey: userData1.sessionKey,
  });
  const workspaceKeys = result.activeWorkspaceKeys.activeWorkspaceKeys;
  expect(workspaceKeys.length).toBe(1);
  const workspaceKey = workspaceKeys[0];
  expect(workspaceKey.generation).toBe(0);
  expect(workspaceKey.workspaceId).toBe(userData1.workspace.id);
  expect(workspaceKey.workspaceKeyBoxes.length).toBe(1);
  const workspaceKeyBox = workspaceKey.workspaceKeyBoxes[0];
  expect(workspaceKeyBox.deviceSigningPublicKey).toBe(
    userData1.device.signingPublicKey
  );
  expect(workspaceKeyBox.creatorDevice.signingPublicKey).toBe(
    workspaceKeyBox.creatorDeviceSigningPublicKey
  );
  expect(workspaceKeyBox.creatorDevice.signingPublicKey).toBe(
    userData1.device.signingPublicKey
  );
  expect(workspaceKeyBox.creatorDevice.signingPublicKey).toBe(
    userData1.device.signingPublicKey
  );
});

test("add device", async () => {
  const loginResult = await createDeviceAndLogin({
    username: userData1.user.username,
    password,
    envelope: userData1.envelope,
    mainDevice: userData1.mainDevice,
  });
  user1Device2 = loginResult.webDevice;
  const { nonce, ciphertext } = createAndEncryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: user1Device2.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    workspaceId: userData1.workspace.id,
  });
  await attachDeviceToWorkspaces({
    graphql,
    deviceSigningPublicKey: user1Device2.signingPublicKey,
    creatorDeviceSigningPublicKey: userData1.device.signingPublicKey, // main device
    deviceWorkspaceKeyBoxes: [
      {
        workspaceId: userData1.workspace.id,
        workspaceKeyDevicePairs: [
          {
            workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
            nonce,
            ciphertext,
          },
        ],
      },
    ],
    authorizationHeader: userData1.sessionKey,
  });

  const result = await getActiveWorkspaceKeys({
    graphql,
    workspaceId: userData1.workspace.id,
    deviceSigningPublicKey: user1Device2.signingPublicKey,
    sessionKey: loginResult.sessionKey,
  });
  const workspaceKeys = result.activeWorkspaceKeys.activeWorkspaceKeys;
  expect(workspaceKeys.length).toBe(1);
  const workspaceKey = workspaceKeys[0];
  expect(workspaceKey.generation).toBe(0);
  expect(workspaceKey.workspaceId).toBe(userData1.workspace.id);
  expect(workspaceKey.workspaceKeyBoxes.length).toBe(1);
  const workspaceKeyBox = workspaceKey.workspaceKeyBoxes[0];
  expect(workspaceKeyBox.deviceSigningPublicKey).toBe(
    user1Device2.signingPublicKey
  );
  expect(workspaceKeyBox.creatorDevice.signingPublicKey).toBe(
    workspaceKeyBox.creatorDeviceSigningPublicKey
  );
  expect(workspaceKeyBox.creatorDevice.signingPublicKey).toBe(
    userData1.device.signingPublicKey
  );
  expect(workspaceKeyBox.creatorDevice.signingPublicKey).toBe(
    userData1.device.signingPublicKey
  );
});

test("delete device", async () => {
  const workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspace: userData1.workspace,
  });

  const loginResult = await createDeviceAndLogin({
    username: userData1.user.username,
    password,
    envelope: userData1.envelope,
    mainDevice: userData1.mainDevice,
  });

  const user1Device3 = loginResult.webDevice;
  const workspaceKeyBox1 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.device.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
  });
  const workspaceKeyBox2 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.webDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
  });
  const workspaceKeyBox3 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: user1Device2.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
  });
  const newDeviceWorkspaceKeyBoxes: WorkspaceWithWorkspaceDevicesParing[] = [
    {
      id: userData1.workspace.id,
      workspaceDevices: [
        {
          receiverDeviceSigningPublicKey: userData1.device.signingPublicKey,
          ciphertext: workspaceKeyBox1.ciphertext,
          nonce: workspaceKeyBox1.nonce,
        },
        {
          receiverDeviceSigningPublicKey: userData1.webDevice.signingPublicKey,
          ciphertext: workspaceKeyBox2.ciphertext,
          nonce: workspaceKeyBox2.nonce,
        },
        {
          receiverDeviceSigningPublicKey: user1Device2.signingPublicKey,
          ciphertext: workspaceKeyBox3.ciphertext,
          nonce: workspaceKeyBox3.nonce,
        },
      ],
    },
  ];
  await deleteDevice({
    graphql,
    creatorSigningPublicKey: userData1.device.signingPublicKey,
    newDeviceWorkspaceKeyBoxes,
    deviceSigningPublicKeyToBeDeleted: user1Device3.signingPublicKey,
    authorizationHeader: userData1.sessionKey,
    mainDevice: userData1.mainDevice,
  });
  const result = await getActiveWorkspaceKeys({
    graphql,
    workspaceId: userData1.workspace.id,
    deviceSigningPublicKey: userData1.device.signingPublicKey,
    sessionKey: userData1.sessionKey,
  });
  const workspaceKeys = result.activeWorkspaceKeys.activeWorkspaceKeys;
  expect(workspaceKeys.length).toBe(2);
  const fetchedWorkspaceKey = workspaceKeys[0];
  expect(fetchedWorkspaceKey.generation).toBe(0);
  expect(fetchedWorkspaceKey.workspaceId).toBe(userData1.workspace.id);
  expect(fetchedWorkspaceKey.workspaceKeyBoxes.length).toBe(1);
  for (let workspaceKeyBox of fetchedWorkspaceKey.workspaceKeyBoxes) {
    const device = userData1.device;
    expect(workspaceKeyBox.deviceSigningPublicKey).toBe(
      device.signingPublicKey
    );
    expect(workspaceKeyBox.creatorDevice.signingPublicKey).toBe(
      workspaceKeyBox.creatorDeviceSigningPublicKey
    );
    expect(workspaceKeyBox.creatorDevice.signingPublicKey).toBe(
      userData1.device.signingPublicKey
    );
    expect(workspaceKeyBox.creatorDevice.signingPublicKey).toBe(
      device.signingPublicKey
    );
  }

  const newWorkspaceKey = await prisma.workspaceKey.findFirst({
    where: { workspaceId: userData1.workspace.id },
    orderBy: { generation: "desc" },
  });

  // TODO: actually re-encrypt documents and folders
  // to test that old workspaceKeyIds are not returned
  await prisma.document.updateMany({
    where: { workspaceId: userData1.workspace.id },
    data: {
      workspaceKeyId: newWorkspaceKey?.id,
    },
  });
  await prisma.folder.updateMany({
    where: { workspaceId: userData1.workspace.id },
    data: {
      workspaceKeyId: newWorkspaceKey?.id,
    },
  });

  const resultAfterUpdate = await getActiveWorkspaceKeys({
    graphql,
    workspaceId: userData1.workspace.id,
    deviceSigningPublicKey: userData1.device.signingPublicKey,
    sessionKey: userData1.sessionKey,
  });
  const updatedWorkspaceKeys =
    resultAfterUpdate.activeWorkspaceKeys.activeWorkspaceKeys;
  expect(updatedWorkspaceKeys.length).toBe(1);
  const updatedWorkspaceKey = updatedWorkspaceKeys[0];
  expect(updatedWorkspaceKey.id).toBe(newWorkspaceKey?.id);
  expect(updatedWorkspaceKey.generation).toBe(1);
  const workspaceKeyBox = updatedWorkspaceKey.workspaceKeyBoxes[0];
  expect(workspaceKeyBox.deviceSigningPublicKey).toBe(
    userData1.device.signingPublicKey
  );
  expect(workspaceKeyBox.creatorDevice.signingPublicKey).toBe(
    workspaceKeyBox.creatorDeviceSigningPublicKey
  );
  expect(workspaceKeyBox.creatorDevice.signingPublicKey).toBe(
    userData1.device.signingPublicKey
  );
  expect(workspaceKeyBox.creatorDevice.signingPublicKey).toBe(
    userData1.device.signingPublicKey
  );
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getActiveWorkspaceKeys({
        graphql,
        workspaceId: userData1.workspace.id,
        deviceSigningPublicKey: userData1.device.signingPublicKey,
        sessionKey: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
