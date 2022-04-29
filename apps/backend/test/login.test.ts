import { gql } from "graphql-request";
import setupGraphql from "./helpers/setupGraphql";
import deleteAllRecords from "./helpers/deleteAllRecords";
import {
  createClientKeyPair,
  createOprfChallenge,
  createUserSession,
  createOprfRegistrationEnvelope,
} from "@serenity-tools/opaque/client";
import { decryptSessionJsonMessage } from "@serenity-tools/opaque/common";
import { requestRegistrationChallengeResponse } from "./helpers/requestRegistrationChallengeResponse";
import { completeRegistration } from "./helpers/completeRegistration";

const graphql = setupGraphql();
const username = "user";
const password = "password";
let data: any = null;
let randomScalar: string = "";

beforeAll(async () => {
  await deleteAllRecords();
});

const requestLoginChallengeResponse = async (
  username: string,
  password: string
) => {
  const { oprfChallenge, randomScalar } = await createOprfChallenge(password);
  const query = gql`
      mutation {
        initializeLogin(
          input: {
            username: "${username}"
            challenge: "${oprfChallenge}"
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
    await requestRegistrationChallengeResponse(graphql, username, password);
  // complete registration
  await completeRegistration(
    graphql,
    username,
    password,
    registrationChallengeResult.data.serverPublicKey,
    registrationChallengeResult.data.oprfPublicKey,
    registrationChallengeResult.data.oprfChallengeResponse,
    registrationChallengeResult.randomScalar
  );
  // clientPublicKey = registrationResponse.clientPublicKey;
  // clientPrivateKey = registrationResponse.clientPublicKey;
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
  // create keys on server side and return response
  const loginChallengeResponse = await requestLoginChallengeResponse(
    username,
    password
  );
  // create login session keys on user side
  const clientSessionKeys = await createUserSession(
    password,
    loginChallengeResponse.data.secret,
    loginChallengeResponse.data.nonce,
    loginChallengeResponse.data.oprfPublicKey,
    loginChallengeResponse.randomScalar,
    loginChallengeResponse.data.oprfChallengeResponse
  );
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
  // client gets login response from server, which contains encrypted data
  const loginResponse = await graphql.client.request(query);
  expect(typeof loginResponse.finalizeLogin.nonce).toBe("string");
  // try to decrypt the oauth token
  const oauthResponseJson = decryptSessionJsonMessage(
    loginResponse.finalizeLogin.oauthData,
    loginResponse.finalizeLogin.nonce,
    clientSessionKeys.sharedRx
  );
  expect(oauthResponseJson.tokenType).toBe("Bearer");
  expect(typeof oauthResponseJson.accessToken).toBe("string");
});
