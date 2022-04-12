import { gql } from "graphql-request";
import setupGraphql from "./helpers/setupGraphql";
import sodium from "libsodium-wrappers-sumo";
import deleteAllRecords from "./helpers/deleteAllRecords";
import {
  createRegistrationEnvelope,
  generateClientOprfChallenge,
  generateKeyPair,
  createUserLoginSession,
} from "@serenity-tools/opaque";

const graphql = setupGraphql();
const username = "user";
const password = "password";
let data: any = null;
let randomScalar: Uint8Array = new Uint8Array(32);
let clientPublicKey: Uint8Array = new Uint8Array(32);
let clientPrivateKey: Uint8Array = new Uint8Array(32);

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
    data: data.initializeRegistration,
    oprfChallenge,
    randomScalar,
  };
};

const completeRegistration = async (
  username: string,
  password: string,
  serverPublicKey: Uint8Array,
  oprfPublicKey: Uint8Array,
  serverChallengeResponse: Uint8Array,
  randomScalar: Uint8Array
) => {
  const clientKeys = generateKeyPair();
  // crate cipher text
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
      finalizeRegistration(
        input: {
          username: "${username}"
          secret: "${b64Secret}"
          nonce: "${b64Nonce}"
          clientPublicKey: "${b64ClientPublicKey}"
        }
      ) {
        status
      }
    }
  `;
  await graphql.client.request(query);
  return {
    clientPrivateKey: clientKeys.privateKey,
    clientPublicKey: clientKeys.publicKey,
    secret: registrationEnvelopeData.secret,
    nonce: registrationEnvelopeData.nonce,
  };
};

beforeAll(async () => {
  await deleteAllRecords();
});

const requestLoginChallengeResponse = async (
  username: string,
  password: string
) => {
  const { oprfChallenge, randomScalar } = generateClientOprfChallenge(password);
  const b64encodedChallenge = sodium.to_base64(oprfChallenge);
  const query = gql`
      mutation {
        initializeLogin(
          input: {
            username: "${username}"
            challenge: "${b64encodedChallenge}"
          }
        ) {
          secret
          nonce
          oprfPublicKey
          oprfChallengeResponse
        }
      }
    `;
  const data = await graphql.client.request(query);
  return {
    data: data.initializeLogin,
    oprfChallenge,
    randomScalar,
  };
};

test("server should register a user", async () => {
  // FIRST TEST ONLY: register a user.
  // we can't run this in beforeAll() because `graphql` isnt' set up
  // generate registration challenge
  const registrationChallengeResult =
    await requestRegistrationChallengeResponse(username, password);
  // finalize registration
  const serverPublicKey = sodium.from_base64(
    registrationChallengeResult.data.serverPublicKey
  );
  const oprfPublicKey = sodium.from_base64(
    registrationChallengeResult.data.oprfPublicKey
  );
  const serverChallengeResponse = sodium.from_base64(
    registrationChallengeResult.data.oprfChallengeResponse
  );
  const registrationResponse = await completeRegistration(
    username,
    password,
    serverPublicKey,
    oprfPublicKey,
    serverChallengeResponse,
    registrationChallengeResult.randomScalar
  );
  clientPublicKey = registrationResponse.clientPublicKey;
  clientPrivateKey = registrationResponse.clientPublicKey;
  randomScalar = registrationChallengeResult.randomScalar;
  // assume this works
});

test("server should create a login challenge response", async () => {
  // generate a challenge code
  const loginChallengeResponse = await requestLoginChallengeResponse(
    username,
    password
  );
  // expect serverPublicKey, oprfPublicKey, oprfChallengeResponse
  // all three should be base64-encoded 32-bit uint8 arrays
  expect(typeof loginChallengeResponse.data.secret).toBe("string");
  expect(typeof loginChallengeResponse.data.nonce).toBe("string");
  expect(typeof loginChallengeResponse.data.oprfPublicKey).toBe("string");
  expect(typeof loginChallengeResponse.data.oprfChallengeResponse).toBe(
    "string"
  );
});

test("server should login a user", async () => {
  // create client keys
  const loginChallengeResponse = await requestLoginChallengeResponse(
    username,
    password
  );
  // crate login session keys
  const secret = sodium.from_base64(loginChallengeResponse.data.secret);
  const nonce = sodium.from_base64(loginChallengeResponse.data.nonce);
  const oprfPublicKey = sodium.from_base64(
    loginChallengeResponse.data.oprfPublicKey
  );
  const oprfChallengeResponse = sodium.from_base64(
    loginChallengeResponse.data.oprfChallengeResponse
  );
  const registrationEnvelopeData = createUserLoginSession(
    password,
    secret,
    nonce,
    oprfPublicKey,
    loginChallengeResponse.randomScalar,
    oprfChallengeResponse
  );
  const sharedRx = registrationEnvelopeData.sharedRx;

  const query = gql`
    mutation {
      finalizeLogin(
        input: {
          username: "${username}"
        }
      ) {
        oauthData
        nonce
      }
    }
  `;
  const loginResponse = await graphql.client.request(query);
  const encryptedOauthResponseBytes = sodium.from_base64(
    loginResponse.finalizeLogin.oauthData
  );
  // TODO: expect an oauth token
  expect(typeof loginResponse.finalizeLogin.nonce).toBe("string");
  const oautResposeNonce = sodium.from_base64(
    loginResponse.finalizeLogin.nonce
  );
  // try to decrypt the oauth token
  const oauthResponseBytes = sodium.crypto_secretbox_open_easy(
    encryptedOauthResponseBytes,
    oautResposeNonce,
    sharedRx
  );
  const oauthResponseString = Buffer.from(oauthResponseBytes.buffer).toString(
    "utf-8"
  );
  const oauthResponse = JSON.parse(oauthResponseString);
  expect(oauthResponse.tokenType).toBe("Bearer");
  expect(typeof oauthResponse.accessToken).toBe("string");
});
