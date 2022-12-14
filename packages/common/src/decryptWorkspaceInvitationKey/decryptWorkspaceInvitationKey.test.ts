import sodium from "@serenity-tools/libsodium";
import { encryptWorkspaceInvitationPrivateKey } from "../encryptWorkspaceInvitationKey/encryptWorkspaceInvitationKey";
import { decryptWorkspaceInvitationKey } from "./decryptWorkspaceInvitationKey";

const exportKey =
  "FlPV3HRQoQArQWpyIUXNGBn2ZTyM4l72oRz91JU04V3DAft2CzHli0aCrGExXFYr4elAB3aeROxY9bVLx8ac4w";

beforeAll(async () => {
  await sodium.ready;
});

test("decryptWorkspaceInvitationId", async () => {
  const keyPair = await sodium.crypto_sign_keypair();
  const encryptedData = await encryptWorkspaceInvitationPrivateKey({
    exportKey,
    workspaceInvitationSigningPrivateKey: keyPair.privateKey,
  });
  const decryptFolderResult = await decryptWorkspaceInvitationKey({
    exportKey,
    ciphertext: encryptedData.ciphertext,
    publicNonce: encryptedData.publicNonce,
    subkeyId: encryptedData.subkeyId,
    encryptionKeySalt: encryptedData.encryptionKeySalt,
  });
  expect(decryptFolderResult).toBe(keyPair.privateKey);
});

test("decryptFolderName with publicData fails for wrong key", async () => {
  const keyPair = await sodium.crypto_sign_keypair();
  const encryptedData = await encryptWorkspaceInvitationPrivateKey({
    exportKey,
    workspaceInvitationSigningPrivateKey: keyPair.privateKey,
  });
  await expect(
    (async () =>
      await decryptWorkspaceInvitationKey({
        exportKey: "4NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto",
        ciphertext: encryptedData.ciphertext,
        publicNonce: encryptedData.publicNonce,
        subkeyId: encryptedData.subkeyId,
        encryptionKeySalt: encryptedData.encryptionKeySalt,
      }))()
  ).rejects.toThrowError(/ciphertext cannot be decrypted using that key/);
});