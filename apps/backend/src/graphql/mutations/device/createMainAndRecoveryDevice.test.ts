import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createMainAndRecoveryDevice } from "../../../../test/helpers/device/createMainAndRecoveryDevice";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

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

test("create main and recovery device", async () => {
  const authorizationHeader = `TODO+${username}`;
  // console.log({ graphql });
  const result = await createMainAndRecoveryDevice({
    graphql,
    authorizationHeader,
  });
  const mainDevice = result.createMainAndRecoveryDevice.mainDevice;
  const recoveryDevice = result.createMainAndRecoveryDevice.recoveryDevice;

  expect(recoveryDevice.userId).toBe(user.id);

  expect(typeof recoveryDevice.ciphertext).toBe("string");
  expect(typeof recoveryDevice.nonce).toBe("string");

  expect(typeof recoveryDevice.deviceSigningPublicKey).toBe("string");
  expect(typeof recoveryDevice.deviceSigningPrivateKey).toBe("string");
  expect(recoveryDevice.deviceSigningKeyType).toBe("ed25519");

  expect(typeof recoveryDevice.deviceEncryptionPublicKey).toBe("string");
  expect(typeof recoveryDevice.deviceEncryptionPrivateKey).toBe("string");
  expect(recoveryDevice.deviceEncryptionKeyType).toBe("curve25519");

  expect(typeof recoveryDevice.signatureForMainDeviceSigningPublicKey).toBe(
    "string"
  );
  expect(typeof recoveryDevice.signatureForRecoveryDeviceSigningPublicKey).toBe(
    "string"
  );

  expect(mainDevice.userId).toBe(user.id);

  expect(typeof mainDevice.signingPublicKey).toBe("string");
  expect(typeof mainDevice.signingPrivateKey).toBe("string");
  expect(mainDevice.signingKeyType).toBe("ed25519");
  expect(typeof mainDevice.encryptionPublicKey).toBe("string");
  expect(typeof mainDevice.encryptionPrivateKey).toBe("string");
  expect(mainDevice.encryptionKeyType).toBe("curve25519");
  expect(typeof mainDevice.encryptionPublicKeySignature).toBe("string");

  // TODO: verify cross-signing
});
