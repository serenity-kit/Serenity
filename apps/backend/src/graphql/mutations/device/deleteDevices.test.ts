import { gql } from "graphql-request";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { deleteDevices } from "../../../../test/helpers/device/deleteDevices";
import { getDeviceBySigningPublicKey } from "../../../../test/helpers/device/getDeviceBySigningKey";
import { getDevices } from "../../../../test/helpers/device/getDevices";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import { createDeviceAndLogin } from "../../../database/testHelpers/createDeviceAndLogin";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const username1 = "user1";
const username2 = "user2";
let userAndDevice1: any;
let userAndDevice2: any;
let sessionKey = "";

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
  const loginResult = await createDeviceAndLogin({
    username: username1,
    password: "12345689",
    envelope: userAndDevice1.envelope,
  });
  sessionKey = loginResult.sessionKey;
});

test("delete a device", async () => {
  const authorizationHeader = sessionKey;
  const numDevicesAfterCreate = await getDevices({
    graphql,
    authorizationHeader,
  });
  expect(numDevicesAfterCreate.devices.edges.length).toBe(3);

  // connected session must exist
  const session = await prisma.session.findFirst({
    where: {
      deviceSigningPublicKey: userAndDevice1.webDevice.signingPublicKey,
    },
  });
  expect(session).not.toBeNull();

  // device should exist
  const response = await deleteDevices({
    graphql,
    signingPublicKeys: [userAndDevice1.webDevice.signingPublicKey],
    authorizationHeader,
  });
  expect(response.deleteDevices.status).toBe("success");

  // check if device still exists
  const numDevicesAfterDelete = await getDevices({
    graphql,
    authorizationHeader,
  });
  expect(numDevicesAfterDelete.devices.edges.length).toBe(2);

  // connected session must have been deleted
  const deletedSession = await prisma.session.findFirst({
    where: {
      deviceSigningPublicKey: userAndDevice1.webDevice.signingPublicKey,
    },
  });
  expect(deletedSession).toBeNull();

  // device should not exist
  await expect(
    (async () =>
      await getDeviceBySigningPublicKey({
        graphql,
        signingPublicKey: userAndDevice1.webDevice.signingPublicKey,
        authorizationHeader,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("user cannot delete a device that doesn't exist", async () => {
  const authorizationHeader = sessionKey;
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
  const authorizationHeader1 = sessionKey;
  const authorizationHeader2 = userAndDevice2.sessionKey;

  const signingPublicKey = userAndDevice2.webDevice.signingPublicKey;
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

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await deleteDevices({
        graphql,
        signingPublicKeys: ["abc"],
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: "somesessionKey",
  };
  const query = gql`
    mutation deleteDevices($input: DeleteDevicesInput!) {
      deleteDevices(input: $input) {
        status
      }
    }
  `;
  test("Invalid signingPublicKeys", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              signingPublicKeys: null,
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
