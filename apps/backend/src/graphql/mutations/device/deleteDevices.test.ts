import {
  encryptWorkspaceKeyForDevice,
  generateId,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { deleteDevices } from "../../../../test/helpers/device/deleteDevices";
import { getDeviceBySigningPublicKey } from "../../../../test/helpers/device/getDeviceBySigningKey";
import { getDevices } from "../../../../test/helpers/device/getDevices";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import { createDeviceAndLogin } from "../../../database/testHelpers/createDeviceAndLogin";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { WorkspaceWithWorkspaceDevicesParing } from "../../../types/workspaceDevice";

const graphql = setupGraphql();
let userData1: any;
let userData2: any;
let workspaceKey = "";
let user1Device2: any = undefined;

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password: "password",
  });
  userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password: "password",
  });
  const loginResult = await createDeviceAndLogin({
    username: userData1.user.username,
    password: "password",
    envelope: userData1.envelope,
    mainDevice: userData1.mainDevice,
  });
  user1Device2 = loginResult.webDevice;
  workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspace: userData1.workspace,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("delete and keep devices mismatch", async () => {
  const authorizationHeader1 = userData1.sessionKey;
  const numDevicesBeforeDeleteResponse = await getDevices({
    graphql,
    hasNonExpiredSession: true,
    authorizationHeader: authorizationHeader1,
  });
  const expectedNumDevices =
    numDevicesBeforeDeleteResponse.devices.edges.length;

  const workspaceKeyBox1 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.device.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKey,
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
      ],
    },
  ];

  // device should not exist
  await expect(
    (async () =>
      await deleteDevices({
        graphql,
        creatorSigningPublicKey: userData1.device.signingPublicKey,
        newDeviceWorkspaceKeyBoxes,
        deviceSigningPublicKeysToBeDeleted: [user1Device2.signingPublicKey],
        authorizationHeader: authorizationHeader1,
      }))()
  ).rejects.toThrowError(/Missing newWorkspaceDevicekeyBox workspaceDevice/);
});

test("delete a device", async () => {
  const authorizationHeader = userData1.sessionKey;
  const numDevicesAfterCreate = await getDevices({
    graphql,
    hasNonExpiredSession: true,
    authorizationHeader,
  });
  expect(numDevicesAfterCreate.devices.edges.length).toBe(3);

  // // connected session must exist
  // const session = await prisma.session.findFirst({
  //   where: {
  //     deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
  //   },
  // });
  // expect(session).not.toBeNull();
  const workspaceKeyBox1 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.device.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKey,
  });
  const workspaceKeyBox2 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.webDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKey,
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
      ],
    },
  ];
  // device should exist
  const response = await deleteDevices({
    graphql,
    creatorSigningPublicKey: userData1.device.signingPublicKey,
    newDeviceWorkspaceKeyBoxes,
    deviceSigningPublicKeysToBeDeleted: [user1Device2.signingPublicKey],
    authorizationHeader,
  });
  expect(response.deleteDevices.status).toBe("success");

  // check if device still exists
  const numDevicesAfterDelete = await getDevices({
    graphql,
    hasNonExpiredSession: true,
    authorizationHeader,
  });
  expect(numDevicesAfterDelete.devices.edges.length).toBe(2);

  // connected session must have been deleted
  // const deletedSession = await prisma.session.findFirst({
  //   where: {
  //     deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
  //   },
  // });
  // expect(deletedSession).toBeNull();

  // device should not exist
  await expect(
    (async () =>
      await getDeviceBySigningPublicKey({
        graphql,
        signingPublicKey: user1Device2.signingPublicKey,
        authorizationHeader,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("won't delete a device they don't own", async () => {
  const authorizationHeader1 = userData1.sessionKey;
  const numDevicesBeforeDeleteResponse = await getDevices({
    graphql,
    hasNonExpiredSession: true,
    authorizationHeader: authorizationHeader1,
  });
  const expectedNumDevices =
    numDevicesBeforeDeleteResponse.devices.edges.length;

  const workspaceKeyBox1 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.device.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKey,
  });
  const workspaceKeyBox2 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.webDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKey,
  });
  const workspaceKeyBox3 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData2.device.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKey,
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
          receiverDeviceSigningPublicKey: userData2.device.signingPublicKey,
          ciphertext: workspaceKeyBox3.ciphertext,
          nonce: workspaceKeyBox3.nonce,
        },
      ],
    },
  ];
  // device should exist
  const response = await deleteDevices({
    graphql,
    creatorSigningPublicKey: userData1.device.signingPublicKey,
    newDeviceWorkspaceKeyBoxes,
    deviceSigningPublicKeysToBeDeleted: [],
    authorizationHeader: authorizationHeader1,
  });
  expect(response.deleteDevices.status).toBe("success");

  // check if device still exists
  const numDevicesAfterDelete = await getDevices({
    graphql,
    hasNonExpiredSession: true,
    authorizationHeader: authorizationHeader1,
  });
  expect(numDevicesAfterDelete.devices.edges.length).toBe(expectedNumDevices);
});

test("delete login device clears session", async () => {
  const authorizationHeader = userData1.sessionKey;
  const numDevicesAfterCreate = await getDevices({
    graphql,
    hasNonExpiredSession: true,
    authorizationHeader,
  });
  expect(numDevicesAfterCreate.devices.edges.length).toBe(2);

  // connected session must exist
  const session = await prisma.session.findFirst({
    where: {
      deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
    },
  });
  expect(session).not.toBeNull();
  const workspaceKeyBox1 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.device.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKey,
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
      ],
    },
  ];
  // device should exist
  const response = await deleteDevices({
    graphql,
    creatorSigningPublicKey: userData1.device.signingPublicKey,
    newDeviceWorkspaceKeyBoxes,
    deviceSigningPublicKeysToBeDeleted: [userData1.webDevice.signingPublicKey],
    authorizationHeader,
  });
  expect(response.deleteDevices.status).toBe("success");

  // // check if device still exists
  const numDevicesAfterDelete = await prisma.device.count({
    where: { userId: userData1.user.id },
  });
  expect(numDevicesAfterDelete).toBe(1);

  // connected session must have been deleted
  const deletedSession = await prisma.session.findFirst({
    where: {
      deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
    },
  });
  expect(deletedSession).toBeNull();

  // device should not exist
  await expect(
    (async () =>
      await getDeviceBySigningPublicKey({
        graphql,
        signingPublicKey: user1Device2.signingPublicKey,
        authorizationHeader,
      }))()
  ).rejects.toThrowError(/Not authenticated/);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await deleteDevices({
        graphql,
        creatorSigningPublicKey: userData1.device.signingPublicKey,
        newDeviceWorkspaceKeyBoxes: [],
        deviceSigningPublicKeysToBeDeleted: [],
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: "somesessionkey",
  };
  const query = gql`
    mutation deleteDevices($input: DeleteDevicesInput!) {
      deleteDevices(input: $input) {
        status
      }
    }
  `;
  test("Invalid creatorSigningPublicKey", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              creatorDeviceSigningPublicKey: null,
              newDeviceWorkspaceKeyBoxes: [],
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No mainDevice", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
              newDeviceWorkspaceKeyBoxes: [],
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
          {
            input: null,
          },
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
