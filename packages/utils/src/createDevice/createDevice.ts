import sodium from "@serenity-tools/libsodium";

export const createDevice = async (encryptionKey: string) => {
  const signingKeyPair = await sodium.crypto_sign_keypair();
  const encryptionKeyPair = await sodium.crypto_box_keypair();
  const encryptionPublicKeySignature = await sodium.crypto_sign_detached(
    encryptionKeyPair.publicKey,
    signingKeyPair.privateKey
  );
  const nonce = await sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );
  const privateKeyPairString = JSON.stringify({
    signingPrivateKey: signingKeyPair.privateKey,
    encryptionPrivateKey: encryptionKeyPair.privateKey,
  });
  const privateKeyPairStringBase64 = sodium.to_base64(privateKeyPairString);
  const cipherText = sodium.crypto_secretbox_easy(
    privateKeyPairStringBase64,
    nonce,
    encryptionKey
  );
  return {
    cipherText,
    nonce,
    encryptionPublicKeySignature,
    signingKeyPair,
    encryptionKeyPair,
  };
};
