import sodium from "libsodium-wrappers-sumo";

export const generateKeyPair = () => {
  const privateKey = sodium.randombytes_buf(
    sodium.crypto_core_ed25519_SCALARBYTES
  );
  const publicKey = sodium.crypto_scalarmult_ed25519_base(privateKey);
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
