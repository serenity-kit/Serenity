import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { encryptWorkspaceKeyForDevice } from "../../../../test/helpers/device/encryptWorkspaceKeyForDevice";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { rotateWorkspaceKey } from "../../../../test/helpers/workspace/rotateWorkspaceKey";
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

test("user cannot revoke own main device", async () => {
  const workspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
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
  const { ciphertext, nonce } = await encryptWorkspaceKeyForDevice({
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
  await expect(
    (async () =>
      await rotateWorkspaceKey({
        graphql,
        workspaceId: userData1.workspace.id,
        creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
        deviceWorkspaceKeyBoxes,
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("user can rotate key", async () => {
  const workspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspace: userData1.workspace,
  });
  const { ciphertext, nonce } = await encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.device.signingPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspaceKey,
  });
  const deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [
    {
      ciphertext,
      nonce,
      receiverDeviceSigningPublicKey: userData1.device.signingPublicKey,
    },
  ];
  const workspaceKeyResult = await rotateWorkspaceKey({
    graphql,
    workspaceId: userData1.workspace.id,
    creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
    deviceWorkspaceKeyBoxes,
    authorizationHeader: userData1.sessionKey,
  });
  const resultingWorkspaceKey =
    workspaceKeyResult.rotateWorkspaceKey.workspaceKey;
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
});

test("user can rotate key for multiple devices", async () => {
  const workspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspace: userData1.workspace,
  });
  const keyData1 = await encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.device.signingPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspaceKey,
  });
  const keyData2 = await encryptWorkspaceKeyForDevice({
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
  const keyData3 = await encryptWorkspaceKeyForDevice({
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
  const workspaceKeyResult = await rotateWorkspaceKey({
    graphql,
    workspaceId: userData1.workspace.id,
    creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
    deviceWorkspaceKeyBoxes,
    authorizationHeader: userData1.sessionKey,
  });
  const resultingWorkspaceKey =
    workspaceKeyResult.rotateWorkspaceKey.workspaceKey;
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
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await rotateWorkspaceKey({
        graphql,
        workspaceId: userData1.workspace.id,
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
    mutation ($input: RotateWorkspaceKeyInput!) {
      rotateWorkspaceKey(input: $input) {
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
