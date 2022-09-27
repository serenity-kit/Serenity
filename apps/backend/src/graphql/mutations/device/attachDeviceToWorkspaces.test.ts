import { gql } from "graphql-request";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { attachDeviceToWorkspaces } from "../../../../test/helpers/device/attachDeviceToWorkspaces";
import { createAndEncryptWorkspaceKeyForDevice } from "../../../../test/helpers/device/createAndEncryptWorkspaceKeyForDevice";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { WorkspaceKey } from "../../../types/workspace";

const graphql = setupGraphql();
const username1 = "user1";
let userAndDevice1: any;

beforeAll(async () => {
  await deleteAllRecords();
  userAndDevice1 = await createUserWithWorkspace({
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    username: username1,
  });
});

test("attach the same device does nothing", async () => {
  const workspaceId = userAndDevice1.workspace.id;
  const existingWorkspaceKeyBox = await prisma.workspaceKeyBox.findFirst({
    where: { workspaceKey: { workspaceId } },
  });
  const authorizationHeader = userAndDevice1.sessionKey;
  const deviceSigningPublicKey = userAndDevice1.device.signingPublicKey;
  const deviceEncryptionPublicKey = userAndDevice1.device.encryptionPublicKey;
  const { nonce, ciphertext } = await createAndEncryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: deviceEncryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userAndDevice1.encryptionPrivateKey,
  });
  const workspaceKeyId = userAndDevice1.workspace.currentWorkspaceKey.id;
  const result = await attachDeviceToWorkspaces({
    graphql,
    deviceSigningPublicKey,
    creatorDeviceSigningPublicKey: deviceSigningPublicKey,
    deviceWorkspaceKeyBoxes: [
      {
        workspaceId,
        workspaceKeyDevicePairs: [
          {
            workspaceKeyId,
            nonce,
            ciphertext,
          },
        ],
      },
    ],
    authorizationHeader,
  });
  const workspaceKeys: WorkspaceKey[] =
    result.attachDeviceToWorkspaces.workspaceKeys;
  expect(workspaceKeys.length).toBe(1);
  const workspaceKey = workspaceKeys[0];
  expect(typeof workspaceKey.id).toBe("string");
  expect(workspaceKey.generation).toBe(0);
  expect(workspaceKey.workspaceId).toBe(workspaceId);
  // // This query will return the newly created workspaceKeyId
  const workspaceKeyBox = workspaceKey.workspaceKeyBox;
  expect(workspaceKeyBox?.ciphertext).toBe(existingWorkspaceKeyBox?.ciphertext);
  expect(workspaceKeyBox?.nonce).toBe(existingWorkspaceKeyBox?.nonce);
  expect(workspaceKeyBox?.deviceSigningPublicKey).toBe(deviceSigningPublicKey);
  expect(workspaceKeyBox?.creatorDeviceSigningPublicKey).toBe(
    deviceSigningPublicKey
  );
  // there should now be two workspacKeyBoxes
  const workspaceKeyBoxes = await prisma.workspaceKeyBox.findMany({
    where: {
      workspaceKeyId: workspaceKey.id,
    },
  });
  expect(workspaceKeyBoxes?.length).toBe(1);
});

test("attach a device to a workspace", async () => {
  const authorizationHeader = userAndDevice1.sessionKey;
  const deviceSigningPublicKey = userAndDevice1.webDevice.signingPublicKey;
  const deviceEncryptionPublicKey =
    userAndDevice1.webDevice.encryptionPublicKey;
  const { nonce, ciphertext } = await createAndEncryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: deviceEncryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userAndDevice1.encryptionPrivateKey,
  });
  const workspaceId = userAndDevice1.workspace.id;
  const workspaceKeyId = userAndDevice1.workspace.currentWorkspaceKey.id;
  const result = await attachDeviceToWorkspaces({
    graphql,
    deviceSigningPublicKey,
    creatorDeviceSigningPublicKey: userAndDevice1.device.signingPublicKey, // main device
    deviceWorkspaceKeyBoxes: [
      {
        workspaceId,
        workspaceKeyDevicePairs: [
          {
            workspaceKeyId,
            nonce,
            ciphertext,
          },
        ],
      },
    ],
    authorizationHeader,
  });
  const workspaceKeys: WorkspaceKey[] =
    result.attachDeviceToWorkspaces.workspaceKeys;
  expect(workspaceKeys.length).toBe(1);
  const workspaceKey = workspaceKeys[0];
  expect(typeof workspaceKey.id).toBe("string");
  expect(workspaceKey.generation).toBe(0);
  expect(workspaceKey.workspaceId).toBe(workspaceId);
  // // This query will return the newly created workspaceKeyId
  const workspaceKeyBox = workspaceKey.workspaceKeyBox;
  expect(workspaceKeyBox?.ciphertext).toBe(ciphertext);
  expect(workspaceKeyBox?.nonce).toBe(nonce);
  expect(workspaceKeyBox?.deviceSigningPublicKey).toBe(deviceSigningPublicKey);
  expect(workspaceKeyBox?.creatorDeviceSigningPublicKey).toBe(
    userAndDevice1.device.signingPublicKey
  );
  // there should now be two workspacKeyBoxes
  const workspaceKeyBoxes = await prisma.workspaceKeyBox.findMany({
    where: {
      workspaceKeyId: workspaceKey.id,
    },
  });
  expect(workspaceKeyBoxes?.length).toBe(2);
});

test("Unauthenticated", async () => {
  const authorizationHeader = "";
  const workspaceId = userAndDevice1.workspace.id;
  const deviceSigningPublicKey = userAndDevice1.device.signingPublicKey;
  const deviceEncryptionPublicKey = userAndDevice1.device.encryptionPublicKey;
  const { nonce, ciphertext } = await createAndEncryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: deviceEncryptionPublicKey,
    creatorDeviceEncryptionPrivateKey:
      userAndDevice1.deviceEncryptionPrivateKey,
  });
  const workspaceKeyId = userAndDevice1.workspace.currentWorkspaceKey.id;
  await expect(
    (async () =>
      await attachDeviceToWorkspaces({
        graphql,
        deviceSigningPublicKey,
        creatorDeviceSigningPublicKey: deviceSigningPublicKey,
        deviceWorkspaceKeyBoxes: [
          {
            workspaceId,
            workspaceKeyDevicePairs: [
              {
                workspaceKeyId,
                nonce,
                ciphertext,
              },
            ],
          },
        ],
        authorizationHeader,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const query = gql`
    mutation attachDeviceToWorkspaces($input: AttachDeviceToWorkspacesInput!) {
      attachDeviceToWorkspaces(input: $input) {
        workspaceKeys {
          id
          generation
          workspaceId
          workspaceKeyBox {
            id
            deviceSigningPublicKey
            creatorDeviceSigningPublicKey
            ciphertext
            nonce
            creatorDevice {
              signingPublicKey
              encryptionPublicKey
            }
          }
        }
      }
    }
  `;
  test("Invalid deviceWorkspaceKeyBox ciphertext", async () => {
    const { nonce } = await createAndEncryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: userAndDevice1.device.signingPublicKey,
      creatorDeviceEncryptionPrivateKey: userAndDevice1.encryptionPrivateKey,
    });
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              creatorDeviceSigningPublicKey:
                userAndDevice1.device.signingPublicKey,
              receiverDeviceSigningPublicKey:
                userAndDevice1.device.signingPublicKey,
              deviceWorkspaceKeyBoxes: [
                {
                  workspaceId: userAndDevice1.workspace.id,
                  nonce,
                },
              ],
            },
          },
          { authorization: userAndDevice1.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid deviceWorkspaceKeyBox nonce", async () => {
    const { ciphertext } = await createAndEncryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: userAndDevice1.device.signingPublicKey,
      creatorDeviceEncryptionPrivateKey: userAndDevice1.encryptionPrivateKey,
    });
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              creatorDeviceSigningPublicKey:
                userAndDevice1.device.signingPublicKey,
              receiverDeviceSigningPublicKey:
                userAndDevice1.device.signingPublicKey,
              deviceWorkspaceKeyBoxes: [
                {
                  workspaceId: userAndDevice1.workspace.id,
                  ciphertext,
                },
              ],
            },
          },
          { authorization: userAndDevice1.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid deviceWorkspaceKeyBox workspaceId", async () => {
    const { ciphertext, nonce } = await createAndEncryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: userAndDevice1.device.signingPublicKey,
      creatorDeviceEncryptionPrivateKey: userAndDevice1.encryptionPrivateKey,
    });
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              creatorDeviceSigningPublicKey:
                userAndDevice1.device.signingPublicKey,
              receiverDeviceSigningPublicKey:
                userAndDevice1.device.signingPublicKey,
              deviceWorkspaceKeyBoxes: [
                {
                  ciphertext,
                  nonce,
                },
              ],
            },
          },
          { authorization: userAndDevice1.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid deviceWorkspaceKeyBoxes", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              creatorDeviceSigningPublicKey:
                userAndDevice1.device.signingPublicKey,
              receiverDeviceSigningPublicKey: undefined,
            },
          },
          { authorization: userAndDevice1.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid deviceSigningPublicKey", async () => {
    const { ciphertext, nonce } = await createAndEncryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: userAndDevice1.device.signingPublicKey,
      creatorDeviceEncryptionPrivateKey: userAndDevice1.encryptionPrivateKey,
    });
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              creatorDeviceSigningPublicKey:
                userAndDevice1.device.signingPublicKey,
              receiverDeviceSigningPublicKey: undefined,
              deviceWorkspaceKeyBoxes: [
                // @ts-ignore testing bad inputs
                {
                  workspaceId: userAndDevice1.workspace.id,
                  ciphertext,
                  nonce,
                },
              ],
            },
          },
          { authorization: userAndDevice1.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No creatorDeviceSigningPublicKey provided", async () => {
    const { ciphertext, nonce } = await createAndEncryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: userAndDevice1.device.signingPublicKey,
      creatorDeviceEncryptionPrivateKey: userAndDevice1.encryptionPrivateKey,
    });
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              creatorDeviceSigningPublicKey: undefined,
              receiverDeviceSigningPublicKey:
                userAndDevice1.device.signingPublicKey,
              deviceWorkspaceKeyBoxes: [
                // @ts-ignore testing bad inputs
                {
                  workspaceId: userAndDevice1.workspace.id,
                  ciphertext,
                  nonce,
                },
              ],
            },
          },
          { authorization: userAndDevice1.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });

  test("Invalid creatorDeviceSigningPublicKey", async () => {
    const authorizationHeader = userAndDevice1.sessionKey;
    const deviceSigningPublicKey = userAndDevice1.webDevice.signingPublicKey;
    const deviceEncryptionPublicKey =
      userAndDevice1.webDevice.encryptionPublicKey;
    const { nonce, ciphertext } = await createAndEncryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: deviceEncryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: userAndDevice1.encryptionPrivateKey,
    });
    const workspaceId = userAndDevice1.workspace.id;
    const workspaceKeyId = userAndDevice1.workspace.currentWorkspaceKey.id;
    await expect(
      (async () =>
        await attachDeviceToWorkspaces({
          graphql,
          deviceSigningPublicKey,
          creatorDeviceSigningPublicKey: "abc",
          deviceWorkspaceKeyBoxes: [
            {
              workspaceId,
              workspaceKeyDevicePairs: [
                {
                  workspaceKeyId,
                  nonce,
                  ciphertext,
                },
              ],
            },
          ],
          authorizationHeader,
        }))()
    ).rejects.toThrowError(/Internal server error/);
  });
});
