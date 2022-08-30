import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { createDevice } from "../../../../test/helpers/device/createDevice";
import { getDeviceBySigningPublicKey } from "../../../../test/helpers/device/getDeviceBySigningKey";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
let sessionKey = "";

beforeAll(async () => {
  await deleteAllRecords();
  const result = await createUserWithWorkspace({
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    username,
  });
  sessionKey = result.sessionKey;
});

test("user should be retrieve a device by signingPublicKey", async () => {
  const authorizationHeader = sessionKey;
  const createDeviceResponse = await createDevice({
    graphql,
    authorizationHeader,
  });
  const createdDevice = createDeviceResponse.createDevice.device;
  const deviceBySigningPublicKey = createdDevice.signingPublicKey;

  const result = await getDeviceBySigningPublicKey({
    graphql,
    signingPublicKey: deviceBySigningPublicKey,
    authorizationHeader,
  });
  const retrivedDevice = result.deviceBySigningPublicKey.device;
  expect(retrivedDevice).toMatchInlineSnapshot(`
    {
      "encryptionPublicKey": "${createdDevice.encryptionPublicKey}",
      "encryptionPublicKeySignature": "${createdDevice.encryptionPublicKeySignature}",
      "signingPublicKey": "${createdDevice.signingPublicKey}",
      "userId": "${createdDevice.userId}",
    }
  `);
});

test("Unauthenticated", async () => {
  const authorizationHeader = sessionKey;
  const createDeviceResponse = await createDevice({
    graphql,
    authorizationHeader,
  });
  const createdDevice = createDeviceResponse.createDevice.device;
  const deviceBySigningPublicKey = createdDevice.signingPublicKey;
  await expect(
    (async () =>
      await getDeviceBySigningPublicKey({
        graphql,
        signingPublicKey: deviceBySigningPublicKey,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
