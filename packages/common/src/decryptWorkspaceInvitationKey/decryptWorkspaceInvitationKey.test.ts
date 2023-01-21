import sodium from "react-native-libsodium";
import { encryptWorkspaceInvitationPrivateKey } from "../encryptWorkspaceInvitationKey/encryptWorkspaceInvitationKey";
import { decryptWorkspaceInvitationKey } from "./decryptWorkspaceInvitationKey";

const exportKey =
  "FlPV3HRQoQArQWpyIUXNGBn2ZTyM4l72oRz91JU04V3DAft2CzHli0aCrGExXFYr4elAB3aeROxY9bVLx8ac4w";

beforeAll(async () => {
  await sodium.ready;
});

test("decryptWorkspaceInvitationId", () => {
  const keyPair = sodium.crypto_sign_keypair();
  const encryptedData = encryptWorkspaceInvitationPrivateKey({
    exportKey,
    workspaceInvitationSigningPrivateKey: sodium.to_base64(keyPair.privateKey),
  });
  const decryptFolderResult = decryptWorkspaceInvitationKey({
    exportKey,
    ciphertext: encryptedData.ciphertext,
    publicNonce: encryptedData.publicNonce,
    subkeyId: encryptedData.subkeyId,
    encryptionKeySalt: encryptedData.encryptionKeySalt,
  });
  expect(decryptFolderResult).toBe(sodium.to_base64(keyPair.privateKey));
});

test("decryptFolderName with publicData fails for wrong key", () => {
  const keyPair = sodium.crypto_sign_keypair();
  const encryptedData = encryptWorkspaceInvitationPrivateKey({
    exportKey,
    workspaceInvitationSigningPrivateKey: sodium.to_base64(keyPair.privateKey),
  });
  expect(() =>
    decryptWorkspaceInvitationKey({
      exportKey: "4NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto",
      ciphertext: encryptedData.ciphertext,
      publicNonce: encryptedData.publicNonce,
      subkeyId: encryptedData.subkeyId,
      encryptionKeySalt: encryptedData.encryptionKeySalt,
    })
  ).toThrowError(/ciphertext cannot be decrypted using that key/);
});
