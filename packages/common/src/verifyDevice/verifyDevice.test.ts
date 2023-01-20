import sodium from "react-native-libsodium";
import { createDevice } from "../createDevice/createDevice";
import { verifyDevice } from "./verifyDevice";

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

test("verify device throws an error with ommited signature", () => {
  const device = createDevice();
  expect(() =>
    verifyDevice({
      ...device,
      // @ts-expect-error desired for the test
      encryptionPublicKeySignature: undefined,
    })
  ).toThrowError();
});
