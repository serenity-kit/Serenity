import { gql } from "graphql-request";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import {
  createClientKeyPair,
  createOprfChallenge,
  createOprfRegistrationEnvelope,
} from "@serenity-tools/opaque/client";
import { requestRegistrationChallengeResponse } from "../../../../test/helpers/requestRegistrationChallengeResponse";
import { completeRegistration } from "../../../../test/helpers/completeRegistration";
import { prisma } from "../../../database/prisma";

const graphql = setupGraphql();
const username = "user";
const password = "password";
const newPassword = "newpassword";
let serverPublicKey = "";
let storedRandomScalar = "";
let passwordResetOneTimePassword: any = "";
let initializePasswordResetData: any = {};

beforeAll(async () => {
  await deleteAllRecords();
});

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
    registrationChallengeResult.randomScalar,
    "f339c9b6-7bdb-48fe-8efa-ea0e4ea4c6f6"
  );
  // clientPublicKey = registrationResponse.clientPublicKey;
  // clientPrivateKey = registrationResponse.clientPublicKey;
  // randomScalar = registrationChallengeResult.randomScalar;
  // assume this works
});

test.skip("user should be able to request a password reset", async () => {
  // request a password reset
  const { oprfChallenge, randomScalar } = await createOprfChallenge(password);
  const query = gql`
        mutation {
            initializePasswordReset(
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
  const resetPasswordChallengeResponse = await graphql.client.request(query);
  initializePasswordResetData =
    resetPasswordChallengeResponse.initializePasswordReset;
  // expect serverPublicKey, oprfPublicKey, oprfChallengeResponse
  // all three should be base64-encoded 32-bit uint8 arrays
  expect(typeof initializePasswordResetData.serverPublicKey).toBe("string");
  expect(typeof initializePasswordResetData.oprfPublicKey).toBe("string");
  expect(typeof initializePasswordResetData.oprfChallengeResponse).toBe(
    "string"
  );

  // also check the otp and expiration from the database
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  const now = new Date();
  expect(user).not.toBeNull();
  expect(user?.passwordResetOneTimePassword?.length).toBe(6);
  expect(
    user?.passwordResetOneTimePasswordExpireDateTime?.getTime()
  ).toBeGreaterThan(now.getTime());

  serverPublicKey = initializePasswordResetData.serverPublicKey;
  passwordResetOneTimePassword = user?.passwordResetOneTimePassword;
  storedRandomScalar = randomScalar;
});

test.skip("user should not be able to reset password with bad token", async () => {
  // request a password reset
  const clientKeyPairs = createClientKeyPair();
  const clientPrivateKey = clientKeyPairs.privateKey;
  const clientPublicKey = clientKeyPairs.publicKey;

  const registrationEnvelopeData = await createOprfRegistrationEnvelope(
    newPassword,
    clientPublicKey,
    clientPrivateKey,
    storedRandomScalar,
    initializePasswordResetData.oprfChallengeResponse,
    initializePasswordResetData.serverPublicKey,
    initializePasswordResetData.oprfPublicKey
  );

  const badOneTimePassword = "9a9999";

  console.log({
    badData: {
      username,
      token: badOneTimePassword,
      now: new Date(),
    },
  });

  const query = gql`
          mutation {
              finalizePasswordReset(
                input: {
                    username: "${username}"
                    token: "${badOneTimePassword}"
                    secret: "${registrationEnvelopeData.secret}"
                    nonce: "${registrationEnvelopeData.nonce}"
                    clientPublicKey: "${clientPublicKey}"
                }
              ) {
                id
              }
          }
      `;
  await expect(graphql.client.request(query)).rejects.toThrow();
});

test.skip("user be able to reset password with correct token", async () => {
  // request a password reset
  const clientKeyPairs = createClientKeyPair();
  const clientPrivateKey = clientKeyPairs.privateKey;
  const clientPublicKey = clientKeyPairs.publicKey;

  const registrationEnvelopeData = await createOprfRegistrationEnvelope(
    newPassword,
    clientPublicKey,
    clientPrivateKey,
    storedRandomScalar,
    initializePasswordResetData.oprfChallengeResponse,
    initializePasswordResetData.serverPublicKey,
    initializePasswordResetData.oprfPublicKey
  );

  console.log({
    goodData: {
      username,
      token: passwordResetOneTimePassword,
      now: new Date(),
    },
  });

  const query = gql`
            mutation {
                finalizePasswordReset(
                  input: {
                      username: "${username}"
                      token: "${passwordResetOneTimePassword}"
                      secret: "${registrationEnvelopeData.secret}"
                      nonce: "${registrationEnvelopeData.nonce}"
                      clientPublicKey: "${clientPublicKey}"
                  }
                ) {
                  id
                }
            }
        `;
  const resetPasswordResponse = await graphql.client.request(query);
  // expect serverPublicKey, oprfPublicKey, oprfChallengeResponse
  // all three should be base64-encoded 32-bit uint8 arrays
  const registrationResponse = await graphql.client.request(query);
  expect(typeof registrationResponse.finalizeRegistration.id).toBe("string");
  const userId = registrationResponse.finalizeRegistration.id;
  expect(resetPasswordResponse).toMatchInlineSnapshot(`
        Object {
            "finalizePasswordReset": Object {
                "id": "${userId}",
            },
        }
    `);
});
/* */
