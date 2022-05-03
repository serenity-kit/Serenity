import { gql } from "graphql-request";
import setupGraphql from "./helpers/setupGraphql";
import sodium from "libsodium-wrappers-sumo";
import deleteAllRecords from "./helpers/deleteAllRecords";
import {
  createClientKeyPair,
  createOprfChallenge,
  createOprfRegistrationEnvelope,
} from "@serenity-tools/opaque/client";
import { requestRegistrationChallengeResponse } from "./helpers/requestRegistrationChallengeResponse";

const graphql = setupGraphql();
const username = "user";
const password = "password";
let data: any = null;
let randomScalar: string = "";

beforeAll(async () => {
  await deleteAllRecords();
});

test("server should create a registration challenge response", async () => {
  // generate a challenge code
  const result = await requestRegistrationChallengeResponse(
    graphql,
    username,
    password
  );
  data = result.data;
  randomScalar = result.randomScalar;
  // expect serverPublicKey, oprfPublicKey, oprfChallengeResponse
  // all three should be base64-encoded 32-bit uint8 arrays
  expect(typeof data.serverPublicKey).toBe("string");
  expect(typeof data.oprfPublicKey).toBe("string");
  expect(typeof data.oprfChallengeResponse).toBe("string");
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
    data.oprfChallengeResponse,
    data.serverPublicKey,
    data.oprfPublicKey
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
