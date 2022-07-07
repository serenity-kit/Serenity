import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDevice } from "../../../../test/helpers/device/createDevice";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { deleteDevices } from "../../../../test/helpers/device/deleteDevices";
import { getDevices } from "../../../../test/helpers/device/getDevices";
import { getDeviceBySigningPublicKey } from "../../../../test/helpers/device/getDeviceBySigningKey";
import { loginUser } from "../../../../test/helpers/loginUser";

const graphql = setupGraphql();
const username1 = "user1";
const username2 = "user2";
let userAndDevice1: any;
let userAndDevice2: any;

beforeAll(async () => {
  await deleteAllRecords();
  userAndDevice1 = await createUserWithWorkspace({
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    username: username1,
  });
  userAndDevice2 = await createUserWithWorkspace({
    id: "7adf9862-a72a-427e-8f7d-0db93f687a44",
    username: username2,
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

  // device should exist
  const response = await deleteDevices({
    graphql,
    signingPublicKeys,
    authorizationHeader,
  });
  expect(response.deleteDevices.status).toBe("success");

  // check if device still exists
  const numDevicesAfterDelete = await getDevices({
    graphql,
    authorizationHeader,
  });
  expect(numDevicesAfterDelete.devices.edges.length).toBe(1);

  // device should not exist
  await expect(
    (async () =>
      await getDeviceBySigningPublicKey({
        graphql,
        signingPublicKey,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Device not found");
});

test("user cannot delete a device that does'nt exist", async () => {
  const authorizationHeader = userAndDevice1.sessionKey;
  const signingPublicKeys = ["abc123"];

  const numDevicesBeforeDeleteResponse = await getDevices({
    graphql,
    authorizationHeader,
  });
  const expectedNumDevices =
    numDevicesBeforeDeleteResponse.devices.edges.length;

  await deleteDevices({
    graphql,
    signingPublicKeys,
    authorizationHeader,
  });

  // check if device still exists
  const numDevicesAfterDelete = await getDevices({
    graphql,
    authorizationHeader,
  });
  expect(numDevicesAfterDelete.devices.edges.length).toBe(expectedNumDevices);
});

test("user cannot delete a device they don't own", async () => {
  const authorizationHeader1 = userAndDevice1.sessionKey;
  const authorizationHeader2 = userAndDevice2.sessionKey;
  const createDeviceResult = await createDevice({
    graphql,
    authorizationHeader: authorizationHeader1,
  });

  const device = createDeviceResult.createDevice.device;
  const signingPublicKey = device.signingPublicKey;
  const signingPublicKeys = [signingPublicKey];

  const numDevicesBeforeDeleteResponse = await getDevices({
    graphql,
    authorizationHeader: authorizationHeader1,
  });
  const expectedNumDevices =
    numDevicesBeforeDeleteResponse.devices.edges.length;

  await deleteDevices({
    graphql,
    signingPublicKeys,
    authorizationHeader: authorizationHeader2,
  });

  // check if device still exists
  const numDevicesAfterDelete = await getDevices({
    graphql,
    authorizationHeader: authorizationHeader1,
  });
  expect(numDevicesAfterDelete.devices.edges.length).toBe(expectedNumDevices);
});
