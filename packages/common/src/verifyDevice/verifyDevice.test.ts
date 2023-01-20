import sodium from "react-native-libsodium";
import { createDevice } from "../createDevice/createDevice";
import { verifyDevice } from "./verifyDevice";

beforeAll(async () => {
  await sodium.ready;
});

test("verify device", async () => {
  const device = await createDevice();
  await expect(verifyDevice(device)).resolves.toBeUndefined();
});

test("verify device throws an error with invalid signature", async () => {
  const device = await createDevice();
  await expect(
    verifyDevice({
      ...device,
      encryptionPublicKeySignature: "invalid",
    })
  ).rejects.toThrowError();
});

test("verify device throws an error with ommited signature", async () => {
  const device = await createDevice();
  expect(
    verifyDevice({
      ...device,
      // @ts-expect-error desired for the test
      encryptionPublicKeySignature: undefined,
    })
  ).rejects.toThrowError();
});
