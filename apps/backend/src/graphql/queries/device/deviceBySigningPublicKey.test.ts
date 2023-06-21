import { Device } from "@serenity-tools/common";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getDeviceBySigningPublicKey } from "../../../../test/helpers/device/getDeviceBySigningKey";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
let sessionKey = "";
let userId = "";
let webDevice: Device | null = null;

beforeAll(async () => {
  await deleteAllRecords();
  const result = await createUserWithWorkspace({
    username,
  });
  webDevice = result.webDevice;
  sessionKey = result.sessionKey;
  userId = result.user.id;
});

test("user should be retrieve a device by signingPublicKey", async () => {
  const authorizationHeader = sessionKey;
  if (!webDevice) {
    throw new Error("Missing the web device");
  }

  const result = await getDeviceBySigningPublicKey({
    graphql,
    signingPublicKey: webDevice.signingPublicKey,
    authorizationHeader,
  });
  const retrivedDevice = result.deviceBySigningPublicKey.device;
  expect(retrivedDevice).toMatchInlineSnapshot(`
    {
      "encryptionPublicKey": "${webDevice.encryptionPublicKey}",
      "encryptionPublicKeySignature": "${webDevice.encryptionPublicKeySignature}",
      "signingPublicKey": "${webDevice.signingPublicKey}",
      "userId": "${userId}",
    }
  `);
});

test("Unauthenticated", async () => {
  if (!webDevice) {
    throw new Error("Missing the web device");
  }

  await expect(
    (async () =>
      await getDeviceBySigningPublicKey({
        graphql,
        signingPublicKey: webDevice.signingPublicKey,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
