// import setupGraphql from "../../../../test/helpers/setupGraphql";
// import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
// import { createDevice } from "../../../../test/helpers/device/createDevice";
// import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
// import { deleteDevices } from "../../../../test/helpers/device/deleteDevices";
// import { getDevices } from "../../../../test/helpers/device/getDevices";
// import { getDeviceBySigningPublicKey } from "../../../../test/helpers/device/getDeviceBySigningKey";

// const graphql = setupGraphql();
// const username1 = "user1";
// const username2 = "user2";
// let user1: any;
// let user2: any;

// beforeAll(async () => {
//   await deleteAllRecords();
//   // TODO: we don't want this before every test
//   user1 = await createUserWithWorkspace({
//     id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
//     username: username1,
//   });
//   user1 = await createUserWithWorkspace({
//     id: "7adf9862-a72a-427e-8f7d-0db93f687a44",
//     username: username2,
//   });
// });

// test("create a device", async () => {
//   const authorizationHeader = `TODO+${username1}`;
//   const createDeviceResult = await createDevice({
//     graphql,
//     authorizationHeader,
//   });
//   const device = createDeviceResult.createDevice.device;
//   const signingPublicKey = device.signingPublicKey;
//   const signingPublicKeys: string[] = [signingPublicKey];

//   const numDevicesAfterCreate = await getDevices({
//     graphql,
//     authorizationHeader,
//   });
//   expect(numDevicesAfterCreate.devices.edges.length).toBe(2);

//   // device should exist
//   const response = await deleteDevices({
//     graphql,
//     signingPublicKeys,
//     authorizationHeader,
//   });
//   expect(response.deleteDevices.status).toBe("success");

//   // check if device still exists
//   const numDevicesAfterDelete = await getDevices({
//     graphql,
//     authorizationHeader,
//   });
//   expect(numDevicesAfterDelete.devices.edges.length).toBe(1);

//   // device should not exist
//   await expect(
//     (async () =>
//       await getDeviceBySigningPublicKey({
//         graphql,
//         signingPublicKey,
//         authorizationHeader,
//       }))()
//   ).rejects.toThrow("Device not found");
// });

// test("user cannot delete a device that does'nt exist", async () => {
//   const authorizationHeader = `TODO+${username1}`;
//   const signingPublicKeys = ["abc123"];

//   const numDevicesBeforeDeleteResponse = await getDevices({
//     graphql,
//     authorizationHeader,
//   });
//   const expectedNumDevices =
//     numDevicesBeforeDeleteResponse.devices.edges.length;

//   await deleteDevices({
//     graphql,
//     signingPublicKeys,
//     authorizationHeader,
//   });

//   // check if device still exists
//   const numDevicesAfterDelete = await getDevices({
//     graphql,
//     authorizationHeader,
//   });
//   expect(numDevicesAfterDelete.devices.edges.length).toBe(expectedNumDevices);
// });

// test("user cannot delete a device they don't own", async () => {
//   const authorizationHeader1 = `TODO+${username1}`;
//   const authorizationHeader2 = `TODO+${username2}`;
//   const createDeviceResult = await createDevice({
//     graphql,
//     authorizationHeader: authorizationHeader1,
//   });

//   const device = createDeviceResult.createDevice.device;
//   const signingPublicKey = device.signingPublicKey;
//   const signingPublicKeys = [signingPublicKey];

//   const numDevicesBeforeDeleteResponse = await getDevices({
//     graphql,
//     authorizationHeader: authorizationHeader1,
//   });
//   const expectedNumDevices =
//     numDevicesBeforeDeleteResponse.devices.edges.length;

//   await deleteDevices({
//     graphql,
//     signingPublicKeys,
//     authorizationHeader: authorizationHeader2,
//   });

//   // check if device still exists
//   const numDevicesAfterDelete = await getDevices({
//     graphql,
//     authorizationHeader: authorizationHeader1,
//   });
//   expect(numDevicesAfterDelete.devices.edges.length).toBe(expectedNumDevices);
// });
