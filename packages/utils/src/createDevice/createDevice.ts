import sodium from "@serenity-tools/libsodium";

export const createDevice = async () => {
  const signingKeyPair = await sodium.crypto_sign_keypair();
  const encryptionKeyPair = await sodium.crypto_box_keypair();
  const encryptionPublicKeySignature = await sodium.crypto_sign_detached(
    encryptionKeyPair.publicKey,
    signingKeyPair.privateKey
  );
  return {
    signingKeyPair,
    encryptionKeyPair,
    encryptionPublicKeySignature,
  };
};
