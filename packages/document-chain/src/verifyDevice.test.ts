import sodium from "react-native-libsodium";
import { shareDocumentDeviceEncryptionPublicKeyDomainContext } from "./constants";
import { verifyDevice, VerifyDeviceParams } from "./verifyDevice";

const createDevice = () => {
  const signingKeyPair = sodium.crypto_sign_keypair();
  const encryptionKeyPair = sodium.crypto_box_keypair();
  const encryptionPublicKeySignature = sodium.crypto_sign_detached(
    shareDocumentDeviceEncryptionPublicKeyDomainContext +
      sodium.to_base64(encryptionKeyPair.publicKey),
    signingKeyPair.privateKey
  );
  const device: VerifyDeviceParams = {
    signingPublicKey: sodium.to_base64(signingKeyPair.publicKey),
    encryptionPublicKey: sodium.to_base64(encryptionKeyPair.publicKey),
    encryptionPublicKeySignature: sodium.to_base64(
      encryptionPublicKeySignature
    ),
  };
  return device;
};

beforeAll(async () => {
  await sodium.ready;
});

test("verify device", () => {
  const device = createDevice();
  expect(verifyDevice(device)).toBeUndefined();
});

test("verify device throws an error with invalid signature", () => {
  const device = createDevice();
  expect(() =>
    verifyDevice({
      ...device,
      encryptionPublicKeySignature: "invalid",
    })
  ).toThrowError();
});

test("verify device throws an error with omitted signature", () => {
  const device = createDevice();
  expect(() =>
    verifyDevice({
      ...device,
      // @ts-expect-error desired for the test
      encryptionPublicKeySignature: undefined,
    })
  ).toThrowError();
});
