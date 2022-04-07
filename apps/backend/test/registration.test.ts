import { gql } from "graphql-request";
import setupGraphql from "./helpers/setupGraphql";
import sodium from "libsodium-wrappers-sumo";
import {
  generateKeyPair,
  sodium_crypto_generichash_batch,
} from "../src/utils/opaque";

const graphql = setupGraphql();
const username = "user";
const password = "password";

beforeEach(async () => {
  // seed DB if necessary
});

// later, this will move to a client class
const generateClientOprfChallenge = (password: string) => {
  // create a curve-mapped password
  console.log({ password });
  const passwordBytes = new Uint8Array(Buffer.from(password));
  console.log({ passwordBytes });
  const hashLength = sodium.crypto_generichash_BYTES;
  console.log({ hashLength });
  const hashedPassword = sodium.crypto_generichash(hashLength, passwordBytes);
  const mappedPassword =
    sodium.crypto_core_ed25519_from_uniform(hashedPassword);
  // create a random scalar
  const randomScalar = sodium.crypto_core_ed25519_scalar_random();
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

const requestRegistrationChallengeResponse = async (
  username: string,
  password: string
) => {
  const { oprfChallenge, randomScalar } = generateClientOprfChallenge(password);
  const b64encodedChallenge = sodium.to_base64(oprfChallenge);
  const query = gql`
    mutation {
      initializeRegistration(
        input: {
          username: "${username}"
          challenge: "${b64encodedChallenge}"
        }
      ) {
        serverPublicKey
        oprfPublicKey
        oprfChallengeResponse
      }
    }
  `;
  const data = await graphql.client.request(query);
  return {
    data,
    oprfChallenge,
    randomScalar,
  };
};

const createRegistrationEnvelope = (
  clientPrivateKey: Uint8Array,
  clientPublicKey: Uint8Array,
  password: string,
  serverChallengeResponse: Uint8Array,
  oprfPublicKey: Uint8Array,
  randomScalar: Uint8Array,
  serverPublicKey: Uint8Array
) => {
  // create randomized password
  const passwordBytes = Buffer.from(password);
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
  const key = Buffer.alloc(sodium.crypto_generichash_KEYBYTES);
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
  const hashSalt = Buffer.alloc(sodium.crypto_pwhash_SALTBYTES);
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
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  // generate cipher text
  const messageData = {
    userPublicKey: sodium.to_base64(clientPublicKey),
    userPrivateKey: sodium.to_base64(clientPrivateKey),
    serverPublicKey: sodium.to_base64(serverPublicKey),
  };
  const messageBytes = Buffer.from(JSON.stringify(messageData));
  const secret = sodium.crypto_secretbox_easy(
    messageBytes,
    nonce,
    argon2DerivedKey
  );
  return { secret, nonce };
};

test("server should create a registration challenge response", async () => {
  // generate a challenge code
  const { data } = await requestRegistrationChallengeResponse(
    username,
    password
  );
  // expect serverPublicKey, oprfPublicKey, oprfChallengeResponse
  // all three should be base64-encoded 32-bit uint8 arrays
  expect(data).toContain("serverPublicKey");
  expect(data).toContain("oprfPublicKey");
  expect(data).toContain("oprfChallengeResponse");
});

test("server should register a user", async () => {
  // generate a challenge code
  const { data, randomScalar } = await requestRegistrationChallengeResponse(
    username,
    password
  );
  // create client keys
  const clientKeys = generateKeyPair();
  // crate cipher text
  const serverPublicKey = sodium.from_base64(data.serverPublicKey);
  const oprfPublicKey = sodium.from_base64(data.oprfPublicKey);
  const serverChallengeResponse = sodium.from_base64(
    data.oprfChallengeResponse
  );
  const registrationEnvelopeData = createRegistrationEnvelope(
    clientKeys.privateKey,
    clientKeys.publicKey,
    password,
    serverChallengeResponse,
    oprfPublicKey,
    randomScalar,
    serverPublicKey
  );
  const b64Secret = sodium.to_base64(registrationEnvelopeData.secret);
  const b64Nonce = sodium.to_base64(registrationEnvelopeData.nonce);
  const b64ClientPublicKey = sodium.to_base64(clientKeys.publicKey);
  const query = gql`
    mutation {
      initializeRegistration(
        input: {
          username: "${username}"
          secret: "${b64Secret}"
          secrnonceet: "${b64Nonce}"
          clientPublicKey: "${b64ClientPublicKey}"
        }
      ) {
        status
      }
    }
  `;
  const registrationResponse = await graphql.client.request(query);
  expect(registrationResponse).toMatchInlineSnapshot(`
    Object {
      "status": "success",
    }
  `);
});
