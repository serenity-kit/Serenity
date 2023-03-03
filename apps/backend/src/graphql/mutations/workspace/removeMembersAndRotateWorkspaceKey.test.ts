import { encryptWorkspaceKeyForDevice } from "@serenity-tools/common";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { attachDeviceToWorkspaces } from "../../../../test/helpers/device/attachDeviceToWorkspaces";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { getWorkspace } from "../../../../test/helpers/workspace/getWorkspace";
import { removeMembersAndRotateWorkspaceKey } from "../../../../test/helpers/workspace/removeMembersAndRotateWorkspaceKey";
import { prisma } from "../../../database/prisma";
import { createDeviceAndLogin } from "../../../database/testHelpers/createDeviceAndLogin";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { WorkspaceDeviceParing } from "../../../types/workspaceDevice";

const graphql = setupGraphql();
let userData1: any = null;
let userData2: any = null;
const password1 = uuidv4();
const password2 = uuidv4();

beforeAll(async () => {
  await deleteAllRecords();
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password: password1,
  });
  userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password: password2,
  });
});

test("user cannot remove self", async () => {
  const workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspace: userData1.workspace,
  });
  const loginResult = await createDeviceAndLogin({
    username: userData1.user.username,
    envelope: userData1.envelope,
    password: password1,
  });
  const newDevice = loginResult.webDevice;
  const { ciphertext, nonce } = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: newDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspaceKey,
  });
  const deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [
    {
      ciphertext,
      nonce,
      receiverDeviceSigningPublicKey: newDevice.signingPublicKey,
    },
  ];
  const revokedUserIds = [userData1.user.id];
  await expect(
    (async () =>
      await removeMembersAndRotateWorkspaceKey({
        graphql,
        workspaceId: userData1.workspace.id,
        revokedUserIds,
        creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
        deviceWorkspaceKeyBoxes,
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("user cannot revoke own main device", async () => {
  const workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspace: userData1.workspace,
  });
  const loginResult = await createDeviceAndLogin({
    username: userData1.user.username,
    envelope: userData1.envelope,
    password: password1,
  });
  const newDevice = loginResult.webDevice;
  const { ciphertext, nonce } = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: newDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspaceKey,
  });
  const deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [
    {
      ciphertext,
      nonce,
      receiverDeviceSigningPublicKey: newDevice.signingPublicKey,
    },
  ];
  const revokedUserIds = [userData2.user.id];
  await expect(
    (async () =>
      await removeMembersAndRotateWorkspaceKey({
        graphql,
        workspaceId: userData1.workspace.id,
        revokedUserIds,
        creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
        deviceWorkspaceKeyBoxes,
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("user can remove another user", async () => {
  const workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspace: userData1.workspace,
  });

  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: userData1.workspace.id,
    authorizationHeader: userData1.sessionKey,
  });
  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  await acceptWorkspaceInvitation({
    graphql,
    workspaceInvitationId: workspaceInvitationId,
    inviteeUsername: userData2.user.username,
    inviteeMainDevice: userData2.mainDevice,
    invitationSigningPrivateKey:
      workspaceInvitationResult.invitationSigningPrivateKey,
    authorizationHeader: userData2.sessionKey,
  });
  const user2DeviceKeyBox = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.device.signingPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspaceKey,
  });
  const user2DeviceKeyBoxes = [
    {
      workspaceId: userData1.workspace.id,
      workspaceKeyDevicePairs: [
        {
          workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
          nonce: user2DeviceKeyBox.nonce,
          ciphertext: user2DeviceKeyBox.nonce,
        },
      ],
    },
  ];
  await attachDeviceToWorkspaces({
    graphql,
    deviceSigningPublicKey: userData2.device.signingPublicKey,
    creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
    authorizationHeader: userData1.sessionKey,
    deviceWorkspaceKeyBoxes: user2DeviceKeyBoxes,
  });
  const { ciphertext, nonce } = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.device.signingPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspaceKey,
  });
  const workspaceUsersBefore = await prisma.usersToWorkspaces.findMany({
    where: { workspaceId: userData1.workspace.id },
  });
  expect(workspaceUsersBefore?.length).toBe(2);
  const workspaceUserIdsBefore = workspaceUsersBefore.map(
    (userToWorkspace) => userToWorkspace.userId
  );
  expect(
    workspaceUserIdsBefore.indexOf(userData1.user.id)
  ).toBeGreaterThanOrEqual(0);
  expect(
    workspaceUserIdsBefore.indexOf(userData2.user.id)
  ).toBeGreaterThanOrEqual(0);
  const deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [
    {
      ciphertext,
      nonce,
      receiverDeviceSigningPublicKey: userData1.device.signingPublicKey,
    },
  ];
  const revokedUserIds = [userData2.user.id];
  const workspaceKeyResult = await removeMembersAndRotateWorkspaceKey({
    graphql,
    workspaceId: userData1.workspace.id,
    revokedUserIds,
    creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
    deviceWorkspaceKeyBoxes,
    authorizationHeader: userData1.sessionKey,
  });
  const resultingWorkspaceKey =
    workspaceKeyResult.removeMembersAndRotateWorkspaceKey.workspaceKey;
  expect(resultingWorkspaceKey.generation).toBe(1);
  expect(resultingWorkspaceKey.workspaceKeyBoxes.length).toBe(1);
  const workspaceKeyBox = resultingWorkspaceKey.workspaceKeyBoxes[0];
  expect(workspaceKeyBox.ciphertext).toBe(ciphertext);
  expect(workspaceKeyBox.nonce).toBe(nonce);
  expect(workspaceKeyBox.creatorDeviceSigningPublicKey).toBe(
    userData1.device.signingPublicKey
  );
  expect(workspaceKeyBox.deviceSigningPublicKey).toBe(
    userData1.device.signingPublicKey
  );
  const workspaceUsersAfter = await prisma.usersToWorkspaces.findMany({
    where: { workspaceId: userData1.workspace.id },
  });
  expect(workspaceUsersAfter?.length).toBe(1);
  const workspaceUserIdsAfter = workspaceUsersAfter.map(
    (userToWorkspace) => userToWorkspace.userId
  );
  expect(
    workspaceUserIdsAfter.indexOf(userData1.user.id)
  ).toBeGreaterThanOrEqual(0);
  expect(workspaceUserIdsAfter.indexOf(userData2.user.id)).toBe(-1);

  const workspaceResult = await getWorkspace({
    graphql,
    workspaceId: userData1.workspace.id,
    deviceSigningPublicKey: userData1.device.signingPublicKey,
    authorizationHeader: userData1.sessionKey,
  });
  const workspace = workspaceResult.workspace;
  expect(workspace.currentWorkspaceKey.id).toBe(resultingWorkspaceKey.id);
  expect(workspace.workspaceKeys.length).toBe(2);
  for (let i = 0; i < workspace.workspaceKeys.length; i++) {
    const workspaceKey = workspace.workspaceKeys[i];
    if (i === 0) {
      expect(workspaceKey.generation).toBe(1);
      expect(workspaceKey.id).toBe(workspace.currentWorkspaceKey.id);
    } else {
      expect(workspaceKey.generation).toBe(0);
      expect(workspaceKey.id).toBe(userData1.workspace.currentWorkspaceKey.id);
    }
    expect(workspaceKey.workspaceKeyBox).not.toBe(null);
    const workspaceKeyBox = workspaceKey.workspaceKeyBox;
    expect(workspaceKeyBox.deviceSigningPublicKey).toBe(
      userData1.device.signingPublicKey
    );
  }
});

test("user can rotate key for multiple devices", async () => {
  const workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspace: userData1.workspace,
  });
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: userData1.workspace.id,
    authorizationHeader: userData1.sessionKey,
  });
  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  await acceptWorkspaceInvitation({
    graphql,
    workspaceInvitationId: workspaceInvitationId,
    inviteeUsername: userData2.user.username,
    inviteeMainDevice: userData2.mainDevice,
    invitationSigningPrivateKey:
      workspaceInvitationResult.invitationSigningPrivateKey,
    authorizationHeader: userData2.sessionKey,
  });
  const user2DeviceKeyBox = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.device.signingPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspaceKey,
  });
  const user2DeviceKeyBoxes = [
    {
      workspaceId: userData1.workspace.id,
      workspaceKeyDevicePairs: [
        {
          workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
          nonce: user2DeviceKeyBox.nonce,
          ciphertext: user2DeviceKeyBox.nonce,
        },
      ],
    },
  ];
  await attachDeviceToWorkspaces({
    graphql,
    deviceSigningPublicKey: userData2.device.signingPublicKey,
    creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
    authorizationHeader: userData1.sessionKey,
    deviceWorkspaceKeyBoxes: user2DeviceKeyBoxes,
  });
  const workspaceUsersBefore = await prisma.usersToWorkspaces.findMany({
    where: { workspaceId: userData1.workspace.id },
  });
  expect(workspaceUsersBefore?.length).toBe(2);
  const workspaceUserIdsBefore = workspaceUsersBefore.map(
    (userToWorkspace) => userToWorkspace.userId
  );
  expect(
    workspaceUserIdsBefore.indexOf(userData1.user.id)
  ).toBeGreaterThanOrEqual(0);
  expect(
    workspaceUserIdsBefore.indexOf(userData2.user.id)
  ).toBeGreaterThanOrEqual(0);
  const keyData1 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.device.signingPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspaceKey,
  });
  const keyData2 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.webDevice.signingPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspaceKey,
  });
  const loginResult = await createDeviceAndLogin({
    username: userData1.user.username,
    envelope: userData1.envelope,
    password: password1,
  });
  const newDevice = loginResult.webDevice;
  const keyData3 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: newDevice.signingPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspaceKey,
  });
  const deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [
    {
      ciphertext: keyData1.ciphertext,
      nonce: keyData1.nonce,
      receiverDeviceSigningPublicKey: userData1.device.signingPublicKey,
    },
    {
      ciphertext: keyData2.ciphertext,
      nonce: keyData2.nonce,
      receiverDeviceSigningPublicKey: userData1.webDevice.signingPublicKey,
    },
    {
      ciphertext: keyData3.ciphertext,
      nonce: keyData3.nonce,
      receiverDeviceSigningPublicKey: newDevice.signingPublicKey,
    },
  ];
  const revokedUserIds = [userData2.user.id];
  const workspaceKeyResult = await removeMembersAndRotateWorkspaceKey({
    graphql,
    workspaceId: userData1.workspace.id,
    revokedUserIds,
    creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
    deviceWorkspaceKeyBoxes,
    authorizationHeader: userData1.sessionKey,
  });
  const resultingWorkspaceKey =
    workspaceKeyResult.removeMembersAndRotateWorkspaceKey.workspaceKey;
  expect(resultingWorkspaceKey.generation).toBe(2);
  expect(resultingWorkspaceKey.workspaceKeyBoxes.length).toBe(3);
  for (let workspaceKeyBox of resultingWorkspaceKey.workspaceKeyBoxes) {
    expect(workspaceKeyBox.creatorDeviceSigningPublicKey).toBe(
      userData1.device.signingPublicKey
    );
    const recevierKey = workspaceKeyBox.deviceSigningPublicKey;
    if (recevierKey === userData1.device.signingPublicKey) {
      expect(workspaceKeyBox.ciphertext).toBe(keyData1.ciphertext);
      expect(workspaceKeyBox.nonce).toBe(keyData1.nonce);
    } else if (recevierKey === userData1.webDevice.signingPublicKey) {
      expect(workspaceKeyBox.ciphertext).toBe(keyData2.ciphertext);
      expect(workspaceKeyBox.nonce).toBe(keyData2.nonce);
    } else if (recevierKey === newDevice.signingPublicKey) {
      expect(workspaceKeyBox.ciphertext).toBe(keyData3.ciphertext);
      expect(workspaceKeyBox.nonce).toBe(keyData3.nonce);
    } else {
      expect(workspaceKeyBox).toBe(undefined);
    }
  }
  const workspaceUsersAfter = await prisma.usersToWorkspaces.findMany({
    where: { workspaceId: userData1.workspace.id },
  });
  expect(workspaceUsersAfter?.length).toBe(1);
  const workspaceUserIdsAfter = workspaceUsersAfter.map(
    (userToWorkspace) => userToWorkspace.userId
  );
  expect(
    workspaceUserIdsAfter.indexOf(userData1.user.id)
  ).toBeGreaterThanOrEqual(0);
  expect(workspaceUserIdsAfter.indexOf(userData2.user.id)).toBe(-1);

  const workspaceResult = await getWorkspace({
    graphql,
    workspaceId: userData1.workspace.id,
    deviceSigningPublicKey: userData1.device.signingPublicKey,
    authorizationHeader: userData1.sessionKey,
  });

  const workspace = workspaceResult.workspace;
  expect(workspace.currentWorkspaceKey.id).toBe(resultingWorkspaceKey.id);
  expect(workspace.workspaceKeys.length).toBe(3);
  for (let i = 0; i < workspace.workspaceKeys.length; i++) {
    const workspaceKey = workspace.workspaceKeys[i];
    if (i === 0) {
      expect(workspaceKey.generation).toBe(2);
      expect(workspaceKey.id).toBe(workspace.currentWorkspaceKey.id);
    } else if (i === 1) {
      expect(workspaceKey.generation).toBe(1);
      expect(workspaceKey.id).not.toBe(
        userData1.workspace.currentWorkspaceKey.id
      );
      expect(workspaceKey.id).not.toBe(workspace.currentWorkspaceKey.id);
    } else {
      expect(workspaceKey.generation).toBe(0);
      expect(workspaceKey.id).toBe(userData1.workspace.currentWorkspaceKey.id);
    }
    expect(workspaceKey.workspaceKeyBox).not.toBe(null);
    const workspaceKeyBox = workspaceKey.workspaceKeyBox;
    expect(workspaceKeyBox.deviceSigningPublicKey).toBe(
      userData1.device.signingPublicKey
    );
  }
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await removeMembersAndRotateWorkspaceKey({
        graphql,
        workspaceId: userData1.workspace.id,
        revokedUserIds: [],
        creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
        deviceWorkspaceKeyBoxes: [],
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: "somesessionkey",
  };
  const query = gql`
    mutation ($input: RemoveMembersAndRotateWorkspaceKeyInput!) {
      removeMembersAndRotateWorkspaceKey(input: $input) {
        workspaceKey {
          id
          generation
          workspaceId
          workspaceKeyBoxes {
            id
            deviceSigningPublicKey
            creatorDeviceSigningPublicKey
            ciphertext
            nonce
          }
        }
      }
    }
  `;
  test("Invalid workspaceInvitationId", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              creatorDeviceSigningPublicKey: null,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          { input: null },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
