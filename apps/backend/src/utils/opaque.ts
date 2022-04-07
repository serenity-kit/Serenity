import sodium from "libsodium-wrappers-sumo";

export const getPublicKeyFromPrivateKey = (privateKey) => {
  const publicKey = sodium.crypto_scalarmult_ed25519_base(privateKey);
  return publicKey;
};

export const generateKeyPair = () => {
  const privateKey = sodium.randombytes_buf(
    sodium.crypto_core_ed25519_SCALARBYTES
  );
  const publicKey = getPublicKeyFromPrivateKey(privateKey);
  const keyPair = {
    publicKey: publicKey,
    privateKey: privateKey,
  };
  return keyPair;
};

export const createOprfChallengeResponse = (
  clientOprfChallenge,
  oprfPrivateKey
) => {
  const requiredChallengeLength = sodium.crypto_scalarmult_ed25519_BYTES;
  if (clientOprfChallenge.length != requiredChallengeLength) {
    throw Error(
      `OPRF challenge is an invalid length. Needs ${requiredChallengeLength} bytes`
    );
  }
  // this value is called beta, b = a ^ k
  const beta = sodium.crypto_scalarmult_ed25519(
    oprfPrivateKey,
    clientOprfChallenge
  );
  return beta;
};

export function sodium_crypto_generichash_batch(arr: Uint8Array) {
  const key = Buffer.alloc(this.crypto_generichash_KEYBYTES);
  const state = this.crypto_generichash_init(
    key,
    this.crypto_generichash_BYTES
  );
  arr.forEach((item) => {
    this.crypto_generichash_update(state, item);
  });
  const combinedHash = this.crypto_generichash_final(
    state,
    this.crypto_generichash_BYTES
  );
  return combinedHash;
}
