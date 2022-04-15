import sodium from "@serenity-tools/libsodium";
import { base64_variants, to_base64 } from "libsodium-wrappers";
export type { StringKeyPair } from "libsodium-wrappers";

type OprfChallengeData = {
  oprfChallenge: string;
  randomScalar: string;
};

type OprfRegistrationEnvelope = {
  secret: string;
  nonce: string;
};

type StringOprfClientSessionKeys = {
  sharedTx: string;
  sharedRx: string;
};

export const createClientKeyPair = () => {
  const keyPair = sodium.crypto_kx_keypair();
  return keyPair;
};

/**
 * Generate a random scalar that's valid for an elliptic curve
 *
 * @returns string representing a scalar
 */
const _createRandomScalar = async (): Promise<string> => {
  const randomScalar = await sodium.crypto_core_ed25519_scalar_random();
  return randomScalar;
};

/**
 * Hash a password using a generic hash
 *
 * @params {Bytes[]} passwordBytes
 * @returns Bytes[] hashed password
 */
const _hashPassword = async (b64Password: string): Promise<string> => {
  const hashLength = sodium.crypto_generichash_BYTES;
  const hashedPassword = await sodium.crypto_generichash(
    hashLength,
    b64Password
  );
  return hashedPassword;
};

/**
 * Treat the hashed password as a vector value and map it to a valid point on an elliptic curve
 *
 * @param {Bytes[]} hashedPassword
 * @returns Bytes[]
 */
const _mapHashedPasswordToEllicpicCurve = async (
  hashedPassword: string
): Promise<string> => {
  const mappedPassword = await sodium.crypto_core_ed25519_from_uniform(
    hashedPassword
  );
  return mappedPassword;
};

/**
 * Create the client's OPRF challenge
 *
 * @param {string} password
 * @returns Object containing password as bytes[], hashed password, password mapped to curve, and a random number
 */
const _getCurveMappedPassword = async (password: string): Promise<string> => {
  const passwordBytes = await sodium.to_base64(password);
  const hashedPassword = await _hashPassword(passwordBytes);
  const mappedPassword = await _mapHashedPasswordToEllicpicCurve(
    hashedPassword
  );
  return mappedPassword;
};

/**
 * Registration step 1: Create an OPRF challenge and random scalar
 * @param {string} password the user's password
 * @returns
 */
export const createOprfChallenge = async (
  password: string
): Promise<OprfChallengeData> => {
  const mappedPassword = await _getCurveMappedPassword(password);
  const randomScalar = await _createRandomScalar();
  const randomPointOnCurve =
    await sodium.crypto_scalarmult_ed25519_base_noclamp(randomScalar);
  const oprfChallenge = await sodium.crypto_core_ed25519_add(
    mappedPassword,
    randomPointOnCurve
  );
  console.log({ oprfChallenge, randomScalar });
  return { oprfChallenge, randomScalar };
};

const _createRandomizedPassword = async (
  password: string,
  serverChallengeResponse: string,
  oprfPublicKey: string,
  randomScalar: string
): Promise<string> => {
  const passwordBytes = sodium.to_base64(password);
  const invertedRandomScalar = await sodium.crypto_core_ed25519_scalar_negate(
    randomScalar
  );
  const exponentiatedPublicKey = await sodium.crypto_scalarmult_ed25519_noclamp(
    invertedRandomScalar,
    oprfPublicKey
  );
  const challengeResponseResult = await sodium.crypto_core_ed25519_add(
    serverChallengeResponse,
    exponentiatedPublicKey
  );
  const randomizedPassword = await sodium.crypto_generichash_batch([
    passwordBytes,
    oprfPublicKey,
    challengeResponseResult,
  ]);
  return randomizedPassword;
};

/**
 * Create an argon2 secure hash of the randomized password generated
 * by `._createRandomizedPassword()`
 *
 * @param {string} randomizedPassword
 * @return {string} hashed randomized password
 */
const _createArgon2RandomizedPaswordHash = async (
  randomizedPassword: string
): Promise<string> => {
  // apply argon2 to rwd using the hardening params sent from the server
  const hashSalt = sodium.to_base64(
    Buffer.alloc(sodium.crypto_pwhash_SALTBYTES)
  );
  const hashOpsLimit = sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE;
  const hashMemLimit = sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE;
  const argon2HashedRandomizedPassword = await sodium.crypto_pwhash(
    32, // TODO: replace with constant value
    randomizedPassword,
    hashSalt,
    hashOpsLimit,
    hashMemLimit,
    // TODO: check if this line needs to be crypto_pwhash_ALG_ARGON2I13
    // or possibly crypto_pwhash_ALG_ARGON2ID13
    sodium.crypto_pwhash_ALG_DEFAULT
  );
  return argon2HashedRandomizedPassword;
};

const _generateNonce = async (): Promise<string> => {
  const nonce = await sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );
  return nonce;
};

/**
 * Registration Step 2: Create the registration envelope, which includes
 * - a nonce
 * - a ciphertext derived from the password and the server public key
 *
 * @param {string} password the user's password
 * @param {bytes[]} randomScalar a random scalar number
 * @param {bytes[]} serverPublicKey the server's public key
 * @param {bytes[]} oprfPublicKey the public key for this authentication
 * @return {object} containing `.secret` (aka cipherText) an encrypted message containing
 *                  user public key, user private key, and server public key
 */
export const createOprfRegistrationEnvelope = async (
  password: string,
  clientPublicKey: string,
  clientPrivateKey: string,
  randomScalar: string,
  serverChallengeResponse: string,
  serverPublicKey: string,
  oprfPublicKey: string
): Promise<OprfRegistrationEnvelope> => {
  const randomizedPassword = await _createRandomizedPassword(
    password,
    serverChallengeResponse,
    oprfPublicKey,
    randomScalar
  );
  const argon2DerivedKey = await _createArgon2RandomizedPaswordHash(
    randomizedPassword
  );
  const nonce = await _generateNonce();
  const messageData = {
    userPublicKey: clientPublicKey,
    userPrivateKey: clientPrivateKey,
    serverPublicKey: serverPublicKey,
  };
  const messageBytes = Buffer.from(JSON.stringify(messageData));
  const secret = sodium.crypto_secretbox_easy(
    messageBytes,
    nonce,
    argon2DerivedKey
  );
  const oprfRegistrationEnvelope = { secret, nonce };
  return oprfRegistrationEnvelope;
};

/**
 * Decrypt the cipherText using the nonce and argon2 derived key
 *
 * @param {bytes[]} cipherText the encrypted cypher text
 *                  containing user public key, user secret key,
 *                  and server public key
 * @param {bytes[]} nonce a random scalar
 * @param {bytes[]} argon2DerivedKey the key derived from the
 *                  randomized password
 * @returns {object} object containing user public key, user secret key
 *                   and server public key
 */
const _openEnvelope = async (
  cipherText,
  nonce,
  argon2DerivedKey
): Promise<StringOprfClientSessionKeys> => {
  // Note: expect that this will throw an error if it can't be decrypted
  const messageBase64 = sodium.crypto_secretbox_open_easy(
    cipherText,
    nonce,
    argon2DerivedKey
  );
  const messageBytes = sodium.from_base64(messageBase64);
  const messageString = Buffer.from(messageBytes.buffer).toString("utf-8");
  const messageData = JSON.parse(messageString);
  const clientSessionKeys = await sodium.crypto_kx_client_session_keys(
    messageData.userPublicKey,
    messageData.userPrivateKey,
    messageData.serverPublicKey
  );
  const b64EncodedClientSessionKeys = {
    sharedRx: to_base64(clientSessionKeys.sharedRx),
    sharedTx: to_base64(clientSessionKeys.sharedTx),
  };
  return b64EncodedClientSessionKeys;
};

export const createUserSession = async (
  password: string,
  cipherText: string,
  nonce: string,
  oprfPublicKey: string,
  randomScalar: string,
  serverChallengeResponse: string
): Promise<StringOprfClientSessionKeys> => {
  const randomizedPassword = await _createRandomizedPassword(
    password,
    serverChallengeResponse,
    oprfPublicKey,
    randomScalar
  );
  const argon2DerivedKey = await _createArgon2RandomizedPaswordHash(
    randomizedPassword
  );
  console.log({ cipherText });
  try {
    const clientSessionKeys = await _openEnvelope(
      cipherText,
      nonce,
      argon2DerivedKey
    );
    return clientSessionKeys;
  } catch (error) {
    throw Error("Invalid password");
  }
};

export const decryptSessionJsonMessage = (
  encryptedOauthResponse: string,
  nonce: string,
  clientSessionRxKey: string
) => {
  console.log({ encryptedOauthResponse });
  console.log({ nonce });
  console.log({ clientSessionRxKey });
  const b64OauthResponse = sodium.crypto_secretbox_open_easy(
    encryptedOauthResponse,
    nonce,
    clientSessionRxKey
  );
  const oauthResponseBytes = sodium.from_base64(b64OauthResponse);
  const oauthResponseString = Buffer.from(oauthResponseBytes.buffer).toString(
    "utf-8"
  );
  const jsonResponse = JSON.parse(oauthResponseString);
  return jsonResponse;
};

export default {
  createClientKeyPair,
  createOprfChallenge,
  createOprfRegistrationEnvelope,
  createUserSession,
  decryptSessionJsonMessage,
};
