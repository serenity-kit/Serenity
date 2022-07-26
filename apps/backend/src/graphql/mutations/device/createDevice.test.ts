import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDevice } from "../../../../test/helpers/device/createDevice";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { getDevices } from "../../../../test/helpers/device/getDevices";

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
