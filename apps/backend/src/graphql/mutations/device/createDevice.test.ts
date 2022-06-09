import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDevice } from "../../../../test/helpers/device/createDevice";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { crypto_sign_verify_detached } from "@serenity-tools/libsodium";

const graphql = setupGraphql();
const username = "user1";
let user: any;

beforeAll(async () => {
  await deleteAllRecords();
  // TODO: we don't want this before every test
  user = await createUserWithWorkspace({
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    username,
  });
});

test("create a device", async () => {
  const authorizationHeader = `TODO+${username}`;
  const result = await createDevice({
    graphql,
    authorizationHeader,
  });
  const device = result.createDevice.device;
  expect(device.userId).toBe(user.id);

  expect(typeof device.signingPublicKey).toBe("string");
  expect(typeof device.signingPrivateKey).toBe("string");
  expect(device.signingKeyType).toBe("ed25519");
  expect(typeof device.encryptionPublicKey).toBe("string");
  expect(typeof device.encryptionPrivateKey).toBe("string");
  expect(device.encryptionKeyType).toBe("curve25519");
  expect(typeof device.encryptionPublicKeySignature).toBe("string");

  // verify the signature
  const expectedMessage = JSON.stringify({
    signingPublicKey: device.signingPublicKey,
    encryptionPublicKey: device.encryptionPublicKey,
  });
  const doesVerify = await crypto_sign_verify_detached(
    device.encryptionPublicKeySignature,
    expectedMessage,
    device.signingPublicKey
  );
  expect(doesVerify).toBe(true);
});
