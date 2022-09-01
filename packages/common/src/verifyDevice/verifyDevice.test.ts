import sodium from "@serenity-tools/libsodium";
import { createDevice } from "../createDevice/createDevice";
import { verifyDevice } from "./verifyDevice";

beforeAll(async () => {
  await sodium.ready;
});

test("verify device", async () => {
  const device = await createDevice();
  await expect(
    (async () => await verifyDevice(device))()
  ).resolves.toBeUndefined();
});

test("verify device throws an error with invalid signature", async () => {
  const device = await createDevice();
  await expect(
    (async () =>
      await verifyDevice({
        ...device,
        encryptionPublicKeySignature: "invalid",
      }))()
  ).rejects.toThrowError();
});

test("verify device throws an error with ommited signature", async () => {
  const device = await createDevice();
  await expect(
    (async () =>
      await verifyDevice({
        ...device,
        // @ts-expected-error desired for the test
        encryptionPublicKeySignature: undefined,
      }))()
  ).rejects.toThrowError();
});
