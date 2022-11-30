import sodium from "@serenity-tools/libsodium";
import { encryptWorkspaceInvitationPrivateKey } from "./encryptWorkspaceInvitationKey";

const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";

beforeAll(async () => {
  await sodium.ready;
});

test("encryptFolderName", async () => {
  const keyPair = await sodium.crypto_sign_keypair();
  const result = await encryptWorkspaceInvitationPrivateKey({
    exportKey: kdfKey,
    workspaceInvitationSigningPrivateKey: keyPair.privateKey,
  });
  expect(typeof result.key).toBe("string");
  expect(result.key.length).toBe(43);
  expect(typeof result.subkeyId).toBe("number");
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});
