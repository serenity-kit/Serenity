import sodium from "react-native-libsodium";
import { encryptWorkspaceInvitationPrivateKey } from "./encryptWorkspaceInvitationKey";

const exportKey =
  "FlPV3HRQoQArQWpyIUXNGBn2ZTyM4l72oRz91JU04V3DAft2CzHli0aCrGExXFYr4elAB3aeROxY9bVLx8ac4w";

beforeAll(async () => {
  await sodium.ready;
});

test("encryptWorkspaceInvitationPrivateKey", async () => {
  const keyPair = sodium.crypto_sign_keypair();
  const result = encryptWorkspaceInvitationPrivateKey({
    exportKey,
    workspaceInvitationSigningPrivateKey: sodium.to_base64(keyPair.privateKey),
  });
  expect(typeof result.key).toBe("string");
  expect(result.key.length).toBe(43);
  expect(typeof result.subkeyId).toBe("number");
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});
