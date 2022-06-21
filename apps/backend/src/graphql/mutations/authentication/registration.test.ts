import { gql } from "graphql-request";
import sodium from "libsodium-wrappers";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { requestRegistrationChallengeResponse } from "../../../../test/helpers/requestRegistrationChallengeResponse";
import {
  createAndEncryptDevice,
  createEncryptionKeyFromOpaqueExportKey,
} from "@serenity-tools/common";

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
  const message = result.registration.finish(
    sodium.from_base64(result.data.challengeResponse)
  );
  const query = gql`
    mutation finishRegistration($input: FinishRegistrationInput!) {
      finishRegistration(input: $input) {
        id
      }
    }
  `;

  const exportKey = result.registration.getExportKey();
  const { encryptionKey, encryptionKeySalt } =
    await createEncryptionKeyFromOpaqueExportKey(sodium.to_base64(exportKey));
  const mainDevice = await createAndEncryptDevice(encryptionKey);

  const registrationResponse = await graphql.client.request(query, {
    input: {
      registrationId: result.data.registrationId,
      message: sodium.to_base64(message),
      mainDevice: {
        ciphertext: mainDevice.cipherText,
        nonce: mainDevice.nonce,
        encryptionPublicKeySignature: mainDevice.encryptionPublicKeySignature,
        encryptionPublicKey: mainDevice.encryptionKeyPair.publicKey,
        signingPublicKey: mainDevice.signingKeyPair.publicKey,
        encryptionKeySalt,
      },
    },
  });
  expect(typeof registrationResponse.finishRegistration.id).toBe("string");
});
