import sodium from "@serenity-tools/libsodium";
import { createDevice } from "../createDevice/createDevice";
import { verifyDevice } from "./verifyDevice";

beforeAll(async () => {
  await sodium.ready;
});

test("verify device", async () => {
  const device = createDevice();
  expect(verifyDevice(device)).toBeUndefined();
});

test("verify device throws an error with invalid signature", async () => {
  const device = createDevice();
  await expect(
    verifyDevice({
      ...device,
      encryptionPublicKeySignature: "invalid",
    })
  ).rejects.toThrowError();
});

test("verify device throws an error with ommited signature", async () => {
  const device = createDevice();
  await expect(
    verifyDevice({
      ...device,
      // @ts-expect-error desired for the test
      encryptionPublicKeySignature: undefined,
    })
  ).rejects.toThrowError();
});
