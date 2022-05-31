import { gql } from "graphql-request";
import sodium from "libsodium-wrappers";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createClientKeyPair } from "@serenity-tools/opaque/client";
import { requestRegistrationChallengeResponse } from "../../../../test/helpers/requestRegistrationChallengeResponse";

const graphql = setupGraphql();
const username = "user";
const password = "password";
let result: any = null;

beforeAll(async () => {
  await deleteAllRecords();
});

test("server should create a registration challenge response", async () => {
  // generate a challenge code
  result = await requestRegistrationChallengeResponse(
    graphql,
    username,
    password
  );
  expect(result.data).toBeDefined();
  expect(typeof result.data.registrationId).toBe("string");
  expect(typeof result.data.challengeResponse).toBe("string");
});

test("server should register a user", async () => {
  // create client keys
  const clientKeys = createClientKeyPair();
  // crate cipher text
  const clientPublicKey = clientKeys.publicKey;
  const message = result.registration.finish(
    sodium.from_base64(result.data.challengeResponse)
  );
  const query = gql`
    mutation finishRegistration($input: FinishRegistrationInput!) {
      finishRegistration(input: $input) {
        status
      }
    }
  `;

  const registrationResponse = await graphql.client.request(query, {
    input: {
      registrationId: result.data.registrationId,
      message: sodium.to_base64(message),
      clientPublicKey,
      workspaceId: "25ef3570-a7c8-4872-a3fb-9521842493ae",
    },
  });
  expect(registrationResponse).toMatchInlineSnapshot(`
    Object {
      "finishRegistration": Object {
        "status": "success",
      },
    }
  `);
});
