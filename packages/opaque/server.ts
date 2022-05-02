import sodium from "libsodium-wrappers-sumo";
// two-week expiry
const USER_LOGIN_ACCESS_TOKEN_EXPIRATION_TIME_IN_SECONDS = 60 * 60 * 24 * 15;

export const getPublicKeyFromEd25519PrivateKey = (privateKey: Uint8Array) => {
  const publicKey = sodium.crypto_scalarmult_ed25519_base(privateKey);
  return publicKey;
};

export const generateKeyPair = () => {
  // Method 1: manual key generation
  /*
  const privateKey = sodium.randombytes_buf(
    sodium.crypto_core_ed25519_SCALARBYTES
  );
  const publicKey = getPublicKeyFromPrivateKey(privateKey);
  const keyPair = {
    publicKey: publicKey,
    privateKey: privateKey,
  };
  // method 2: use crypto_kx_seed keypair, since we will
  // be using the keys for
  // crypto_kx_client_session_keys and
  // crypto_kx_server_session_keys
  /* */
  // const seed = sodium.randombytes_buf(sodium.crypto_kx_SEEDBYTES);
  // const keyPair = sodium.crypto_kx_seed_keypair(seed);
  const keyPair = sodium.crypto_kx_keypair();
  // return generateOprfKeyPair();
  /* */
  return keyPair;
};

export const generateOprfKeyPair = () => {
  const privateKey = sodium.randombytes_buf(
    sodium.crypto_core_ed25519_SCALARBYTES
  );
  const publicKey = getPublicKeyFromEd25519PrivateKey(privateKey);
  const keyPair = {
    publicKey: publicKey,
    privateKey: privateKey,
    keyType: "oprf",
  };
  return keyPair;
};

export const createOprfChallengeResponse = (
  clientOprfChallenge: Uint8Array,
  oprfPrivateKey: Uint8Array
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

export const generateNonce = (): Uint8Array => {
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  // const nonce = sodium.from_base64("6dMYpCk9kvqw0vFxyq5j_Xem7nNaEVNU");
  return nonce;
};

export const generateOauthAccessToken = () => {
  const accessToken = sodium.to_base64(
    sodium.crypto_core_ed25519_scalar_random()
  );
  const expiresAt = new Date(
    Date.now() + USER_LOGIN_ACCESS_TOKEN_EXPIRATION_TIME_IN_SECONDS
  );
  return {
    accessToken,
    expiresAt,
  };
};

/*
// later, this will move to a client class
export const generateClientOprfChallenge = (password: string) => {
  // create a curve-mapped password
  const passwordBytes = new Uint8Array(Buffer.from(password));
  const hashLength = sodium.crypto_generichash_BYTES;
  const hashedPassword = sodium.crypto_generichash(hashLength, passwordBytes);
  const mappedPassword =
    sodium.crypto_core_ed25519_from_uniform(hashedPassword);
  // create a random scalar
  // const randomScalar = sodium.crypto_core_ed25519_scalar_random();
  const randomScalar = sodium.from_base64(
    "JyUYBYuLMDevU6OY39v0L7qs7nCYw3pSzgnWti6GQQQ"
  );
  // create a random point on curve
  const randomPointOnCurve =
    sodium.crypto_scalarmult_ed25519_base_noclamp(randomScalar);
  // create oprf challenge
  const oprfChallenge = sodium.crypto_core_ed25519_add(
    mappedPassword,
    randomPointOnCurve
  );
  return { oprfChallenge, randomScalar };
};
/* */

/*
export const crypto_generichash_batch = (
  arr: Array<Uint8Array>
): Uint8Array => {
  // TODO remove/cleanup? Buffer should not be needed
  const key = new Uint8Array(Buffer.alloc(sodium.crypto_generichash_KEYBYTES));
  const state = sodium.crypto_generichash_init(
    key,
    sodium.crypto_generichash_BYTES
  );
  arr.forEach((item) => {
    sodium.crypto_generichash_update(state, item);
  });
  const combinedHash = sodium.crypto_generichash_final(
    state,
    sodium.crypto_generichash_BYTES
  );
  return combinedHash;
};
/* */

/*
export const createRegistrationEnvelope = (
  clientPrivateKey: Uint8Array,
  clientPublicKey: Uint8Array,
  password: string,
  serverChallengeResponse: Uint8Array,
  oprfPublicKey: Uint8Array,
  randomScalar: Uint8Array,
  serverPublicKey: Uint8Array
) => {
  // create randomized password
  const passwordBytes = new Uint8Array(Buffer.from(password));
  const invertedRandomScalar =
    sodium.crypto_core_ed25519_scalar_negate(randomScalar);
  const exponentiatedPublicKey = sodium.crypto_scalarmult_ed25519_noclamp(
    invertedRandomScalar,
    oprfPublicKey
  );
  const challengeResponseResult = sodium.crypto_core_ed25519_add(
    serverChallengeResponse,
    exponentiatedPublicKey
  );
  const arr = [passwordBytes, oprfPublicKey, challengeResponseResult];
  // combine hashes
  const combinedHash = crypto_generichash_batch(arr);
  // const key = new Uint8Array(Buffer.alloc(sodium.crypto_generichash_KEYBYTES));
  // const state = sodium.crypto_generichash_init(
  //   key,
  //   sodium.crypto_generichash_BYTES
  // );
  // arr.forEach((item) => {
  //   sodium.crypto_generichash_update(state, item);
  // });
  // const combinedHash = sodium.crypto_generichash_final(
  //   state,
  //   sodium.crypto_generichash_BYTES
  // );
  const randomizedPassword = combinedHash;
  // derive key from randomized password
  const hashSalt = new Uint8Array(Buffer.alloc(sodium.crypto_pwhash_SALTBYTES));
  const hashOpsLimit = sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE;
  const hashMemLimit = sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE;
  const argon2DerivedKey = sodium.crypto_pwhash(
    32,
    randomizedPassword,
    hashSalt,
    hashOpsLimit,
    hashMemLimit,
    sodium.crypto_pwhash_ALG_DEFAULT
  );
  // generate nonce
  // const nonce = sodium.from_base64("6dMYpCk9kvqw0vFxyq5j_Xem7nNaEVNU"); // sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const nonce = generateNonce();
  // generate cipher text
  const messageData = {
    userPublicKey: sodium.to_base64(clientPublicKey),
    userPrivateKey: sodium.to_base64(clientPrivateKey),
    serverPublicKey: sodium.to_base64(serverPublicKey),
  };
  const messageBytes = new Uint8Array(Buffer.from(JSON.stringify(messageData)));
  const secret = sodium.crypto_secretbox_easy(
    messageBytes,
    nonce,
    argon2DerivedKey
  );
  return { secret, nonce };
};
/* */

/*
export function createUserLoginSession(
  password: string,
  secret: Uint8Array,
  nonce: Uint8Array,
  oprfPublicKey: Uint8Array,
  randomScalar: Uint8Array,
  serverChallengeResponse: Uint8Array
) {
  // create randomized password
  const passwordBytes = new Uint8Array(Buffer.from(password));
  const invertedRandomScalar =
    sodium.crypto_core_ed25519_scalar_negate(randomScalar);
  const exponentiatedPublicKey = sodium.crypto_scalarmult_ed25519_noclamp(
    invertedRandomScalar,
    oprfPublicKey
  );
  const challengeResponseResult = sodium.crypto_core_ed25519_add(
    serverChallengeResponse,
    exponentiatedPublicKey
  );
  const arr = [passwordBytes, oprfPublicKey, challengeResponseResult];
  // combine hashes
  const key = new Uint8Array(Buffer.alloc(sodium.crypto_generichash_KEYBYTES));
  const state = sodium.crypto_generichash_init(
    key,
    sodium.crypto_generichash_BYTES
  );
  arr.forEach((item) => {
    sodium.crypto_generichash_update(state, item);
  });
  const combinedHash = sodium.crypto_generichash_final(
    state,
    sodium.crypto_generichash_BYTES
  );
  const randomizedPassword = combinedHash;

  // derive key from randomized password
  const hashSalt = new Uint8Array(Buffer.alloc(sodium.crypto_pwhash_SALTBYTES));
  const hashOpsLimit = sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE;
  const hashMemLimit = sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE;
  const argon2DerivedKey = sodium.crypto_pwhash(
    32,
    randomizedPassword,
    hashSalt,
    hashOpsLimit,
    hashMemLimit,
    sodium.crypto_pwhash_ALG_DEFAULT
  );
  // open the encrypted envelope
  try {
    const messageBytes = sodium.crypto_secretbox_open_easy(
      secret,
      nonce,
      argon2DerivedKey
    );
    const messageString = Buffer.from(messageBytes.buffer).toString("utf-8");
    const messageData = JSON.parse(messageString);
    const userPublicKey = sodium.from_base64(messageData.userPublicKey);
    const userPrivateKey = sodium.from_base64(messageData.userPrivateKey);
    const serverPublicKey = sodium.from_base64(messageData.serverPublicKey);
    const clientSharedKeys = sodium.crypto_kx_client_session_keys(
      userPublicKey,
      userPrivateKey,
      serverPublicKey
    );
    return clientSharedKeys;
  } catch (error) {
    throw Error("Invalid password");
  }
}
/* */
