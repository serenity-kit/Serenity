import { createDevice as createdDeviceHelper } from "@serenity-tools/common";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDevice } from "../../../../test/helpers/device/createDevice";
import { getDevices } from "../../../../test/helpers/device/getDevices";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

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

test("create a device", async () => {
  const authorizationHeader = userAndDevice1.sessionKey;
  const createDeviceResult = await createDevice({
    graphql,
    authorizationHeader,
  });
  const device = createDeviceResult.createDevice.device;
  const signingPublicKey = device.signingPublicKey;
  const signingPublicKeys: string[] = [signingPublicKey];

  const numDevicesAfterCreate = await getDevices({
    graphql,
    authorizationHeader,
  });
  expect(numDevicesAfterCreate.devices.edges.length).toBe(2);
});

test("Unauthenticated", async () => {
  const authorizationHeader = "";
  await expect(
    (async () =>
      await createDevice({
        graphql,
        authorizationHeader,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: "somesessionKey",
  };
  const id = uuidv4();
  const query = gql`
    mutation createDevice($input: CreateDeviceInput!) {
      createDevice(input: $input) {
        device {
          userId
          signingPublicKey
          encryptionPublicKey
          encryptionPublicKeySignature
          info
        }
      }
    }
  `;

  test("Invalid signingPublicKey", async () => {
    const device = await createdDeviceHelper();
    const deviceInfoJson = {
      type: "web",
      OS: "MacOS",
      OsVersion: null,
      Browser: "chrome",
      BrowserVersion: "100.0.1",
    };
    const deviceInfo = JSON.stringify(deviceInfoJson);
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              signingPublicKey: null,
              encryptionPublicKey: device.encryptionPublicKey,
              encryptionPublicKeySignature: device.encryptionPublicKeySignature,
              info: deviceInfo,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid encryptionPublicKey", async () => {
    const device = await createdDeviceHelper();
    const deviceInfoJson = {
      type: "web",
      OS: "MacOS",
      OsVersion: null,
      Browser: "chrome",
      BrowserVersion: "100.0.1",
    };
    const deviceInfo = JSON.stringify(deviceInfoJson);
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              signingPublicKey: device.signingPublicKey,
              encryptionPublicKey: null,
              encryptionPublicKeySignature: device.encryptionPublicKeySignature,
              info: deviceInfo,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  // TODO: consider testing if the encryptionPublicKeySignature is valid for the encryptionPublicKey
  test("Invalid encryptionPublicKeySignature", async () => {
    const device = await createdDeviceHelper();
    const deviceInfoJson = {
      type: "web",
      OS: "MacOS",
      OsVersion: null,
      Browser: "chrome",
      BrowserVersion: "100.0.1",
    };
    const deviceInfo = JSON.stringify(deviceInfoJson);
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              signingPublicKey: device.signingPublicKey,
              encryptionPublicKey: device.encryptionPublicKey,
              encryptionPublicKeySignature: null,
              info: deviceInfo,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid encryptionPublicKeySignature", async () => {
    const device = await createdDeviceHelper();
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              signingPublicKey: device.signingPublicKey,
              encryptionPublicKey: device.encryptionPublicKey,
              encryptionPublicKeySignature: device.encryptionPublicKeySignature,
              info: null,
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
