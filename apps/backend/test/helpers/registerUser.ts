import { gql } from "graphql-request";
import sodium from "@serenity-tools/libsodium";
import { requestRegistrationChallengeResponse } from "./requestRegistrationChallengeResponse";
import { createDevice } from "./device/createDevice";
import { finishRegistration } from "@serenity-tools/opaque";
import { prisma } from "../../src/database/prisma";

let result: any = null;

export const registerUser = async (
  graphql: any,
  username: string,
  password: string
) => {
  result = await requestRegistrationChallengeResponse(
    graphql,
    username,
    password
  );

  const startRegistrationResult = result.registration.finish(
    sodium.from_base64(result.data.challengeResponse)
  );
  const query = gql`
    mutation finishRegistration($input: FinishRegistrationInput!) {
      finishRegistration(input: $input) {
        id
      }
    }
  `;

  const { response, exportKey } = await finishRegistration(
    startRegistrationResult.data.challengeResponse
  );

  const encryptionKeySalt = await sodium.randombytes_buf(
    sodium.crypto_pwhash_SALTBYTES
  );
  const encryptionKey = await sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    exportKey,
    encryptionKeySalt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );
  const device = await createDevice(encryptionKey);

  const registrationResponse = await graphql.client.request(query, {
    input: {
      registrationId: result.data.registrationId,
      message: sodium.to_base64(startRegistrationResult),
      clientPublicKey: "TODO",
      mainDevice: {
        encryptionKeySalt,
        ciphertext: device.ciphertext,
        nonce: device.nonce,
        singingPublicKey: device.signingPublicKey,
        encryptionPublicKey: device.encryptionPublicKey,
        encryptionPublicKeySignature: device.encryptionPublicKeySignature,
      },
    },
  });

  // now confirm the user
  const unconfirmedUser = await prisma.unconfirmedUser.findFirst({
    where: {
      id: registrationResponse.finishRegistration.id,
    },
  });
  if (!unconfirmedUser) {
    throw new Error("No unconfirmed user found");
  }
  const confirmUserQuery = gql`
    mutation confirmUser($input: ConfirmUserInput!) {
      confirmUser(input: $input) {
        successs
      }
    }
  `;
  const confirmUserResponse = await graphql.client.request(confirmUserQuery, {
    input: {
      username: unconfirmedUser.username,
      confirmationCode: unconfirmedUser.confirmationCode,
    },
  });

  return {
    confirmUserResponse,
    registrationResponse,
    clientPrivateKey: "TODO",
    clientPublicKey: "TODO",
    encryptionPrivateKey: device.encryptionPrivateKey,
    signingPrivateKey: device.signingPrivateKey,
    encryptionKey: encryptionKey,
  };
};
