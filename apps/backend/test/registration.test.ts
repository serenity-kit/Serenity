import { gql } from "graphql-request";
import setupGraphql from "./helpers/setupGraphql";
import sodium from "libsodium-wrappers-sumo";
import deleteAllRecords from "./helpers/deleteAllRecords";
import {
  createRegistrationEnvelope,
  generateClientOprfChallenge,
  generateKeyPair,
} from "@serenity-tools/opaque/server";

const graphql = setupGraphql();
const username = "user";
const password = "password";
let data: any = null;
let randomScalar: Uint8Array = new Uint8Array(32);

beforeAll(async () => {
  await deleteAllRecords();
});

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

test.only("server should create a registration challenge response", async () => {
  // generate a challenge code
  const result = await requestRegistrationChallengeResponse(username, password);
  data = result.data;
  randomScalar = result.randomScalar;
  // expect serverPublicKey, oprfPublicKey, oprfChallengeResponse
  // all three should be base64-encoded 32-bit uint8 arrays
  expect(typeof data.initializeRegistration.serverPublicKey).toBe("string");
  expect(typeof data.initializeRegistration.oprfPublicKey).toBe("string");
  expect(typeof data.initializeRegistration.oprfChallengeResponse).toBe(
    "string"
  );
});

test("server should register a user", async () => {
  // create client keys
  const clientKeys = generateKeyPair();
  // crate cipher text
  const serverPublicKey = sodium.from_base64(
    data.initializeRegistration.serverPublicKey
  );
  const oprfPublicKey = sodium.from_base64(
    data.initializeRegistration.oprfPublicKey
  );
  const serverChallengeResponse = sodium.from_base64(
    data.initializeRegistration.oprfChallengeResponse
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
  const registrationResponse = await graphql.client.request(query);
  expect(registrationResponse).toMatchInlineSnapshot(`
    Object {
      "finalizeRegistration": Object {
        "status": "success",
      },
    }
  `);
});
