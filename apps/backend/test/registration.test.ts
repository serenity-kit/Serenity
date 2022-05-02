import { gql } from "graphql-request";
import setupGraphql from "./helpers/setupGraphql";
import sodium from "libsodium-wrappers-sumo";
import deleteAllRecords from "./helpers/deleteAllRecords";
import {
  createClientKeyPair,
  createOprfChallenge,
  createOprfRegistrationEnvelope,
} from "@serenity-tools/opaque/client";

const graphql = setupGraphql();
const username = "user";
const password = "password";
let data: any = null;
let randomScalar: string = "";

beforeAll(async () => {
  await deleteAllRecords();
});

const requestRegistrationChallengeResponse = async (
  username: string,
  password: string
) => {
  const { oprfChallenge, randomScalar } = await createOprfChallenge(password);
  const query = gql`
    mutation {
      initializeRegistration(
        input: {
          username: "${username}"
          challenge: "${oprfChallenge}"
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

test("server should create a registration challenge response", async () => {
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
  const clientKeys = createClientKeyPair();
  // crate cipher text
  const clientPublicKey = clientKeys.publicKey;
  const clientPrivateKey = clientKeys.privateKey;
  const registrationEnvelopeData = await createOprfRegistrationEnvelope(
    password,
    clientPublicKey,
    clientPrivateKey,
    randomScalar,
    data.initializeRegistration.oprfChallengeResponse,
    data.initializeRegistration.serverPublicKey,
    data.initializeRegistration.oprfPublicKey
  );
  const query = gql`
    mutation {
      finalizeRegistration(
        input: {
          username: "${username}"
          secret: "${registrationEnvelopeData.secret}"
          nonce: "${registrationEnvelopeData.nonce}"
          clientPublicKey: "${clientKeys.publicKey}"
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
