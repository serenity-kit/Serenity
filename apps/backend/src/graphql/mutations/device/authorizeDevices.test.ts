import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { authorizeDevices } from "../../../../test/helpers/device/authorizeDevices";
import { encryptWorkspaceKeyForDevice } from "../../../../test/helpers/device/encryptWorkspaceKeyForDevice";
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
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password: "password",
  });
  userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password: "password",
  });
  const loginResult = await createDeviceAndLogin({
    username: userData1.user.username,
    password: "password",
    envelope: userData1.envelope,
  });
  user1Device2 = loginResult.webDevice;
  workspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspace: userData1.workspace,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("delete a device", async () => {
  const authorizationHeader = userData1.sessionKey;
  const numDevicesAfterCreate = await getDevices({
    graphql,
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
  const workspaceKeyBox1 = await encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.device.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKey,
  });
  const workspaceKeyBox2 = await encryptWorkspaceKeyForDevice({
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
  const response = await authorizeDevices({
    graphql,
    creatorSigningPublicKey: userData1.device.signingPublicKey,
    newDeviceWorkspaceKeyBoxes,
    authorizationHeader,
  });
  expect(response.authorizeDevices.status).toBe("success");

  // check if device still exists
  const numDevicesAfterDelete = await getDevices({
    graphql,
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

test("won't authorized a device they don't own", async () => {
  const authorizationHeader1 = userData1.sessionKey;
  const numDevicesBeforeDeleteResponse = await getDevices({
    graphql,
    authorizationHeader: authorizationHeader1,
  });
  const expectedNumDevices =
    numDevicesBeforeDeleteResponse.devices.edges.length;

  const workspaceKeyBox1 = await encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.device.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKey,
  });
  const workspaceKeyBox2 = await encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.webDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceKey,
  });
  const workspaceKeyBox3 = await encryptWorkspaceKeyForDevice({
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
  const response = await authorizeDevices({
    graphql,
    creatorSigningPublicKey: userData1.device.signingPublicKey,
    newDeviceWorkspaceKeyBoxes,
    authorizationHeader: authorizationHeader1,
  });
  expect(response.authorizeDevices.status).toBe("success");

  // check if device still exists
  const numDevicesAfterDelete = await getDevices({
    graphql,
    authorizationHeader: authorizationHeader1,
  });
  expect(numDevicesAfterDelete.devices.edges.length).toBe(expectedNumDevices);
});

test("delete login device clears session", async () => {
  const authorizationHeader = userData1.sessionKey;
  const numDevicesAfterCreate = await getDevices({
    graphql,
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
  const workspaceKeyBox1 = await encryptWorkspaceKeyForDevice({
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
  const response = await authorizeDevices({
    graphql,
    creatorSigningPublicKey: userData1.device.signingPublicKey,
    newDeviceWorkspaceKeyBoxes,
    authorizationHeader,
  });
  expect(response.authorizeDevices.status).toBe("success");

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
      await authorizeDevices({
        graphql,
        creatorSigningPublicKey: userData1.device.signingPublicKey,
        newDeviceWorkspaceKeyBoxes: [],
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: "somesessionkey",
  };
  const query = gql`
    mutation authorizeDevices($input: AuthorizeDevicesInput!) {
      authorizeDevices(input: $input) {
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
