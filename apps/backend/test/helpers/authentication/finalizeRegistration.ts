import { client } from "@serenity-kit/opaque";
import * as userChain from "@serenity-kit/user-chain";
import { createAndEncryptMainDevice } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "libsodium-wrappers";

export type Props = {
  graphql: any;
  challengeResponse: string;
  registration: string;
  password: string;
  username: string;
};
export const finalizeRegistration = async ({
  graphql,
  challengeResponse,
  registration,
  password,
  username,
}: Props) => {
  const clientRegistrationFinishResult = client.finishRegistration({
    password,
    clientRegistrationState: registration,
    registrationResponse: challengeResponse,
  });

  const query = gql`
    mutation finishRegistration($input: FinishRegistrationInput!) {
      finishRegistration(input: $input) {
        id
      }
    }
  `;

  const exportKey = clientRegistrationFinishResult.exportKey;
  const { signingPrivateKey, encryptionPrivateKey, ...mainDevice } =
    createAndEncryptMainDevice(sodium.to_base64(exportKey));

  const createChainEvent = userChain.createChain({
    authorKeyPair: {
      privateKey: signingPrivateKey,
      publicKey: mainDevice.signingPublicKey,
    },
    email: username,
    encryptionPublicKey: mainDevice.encryptionPublicKey,
  });

  const registrationResponse = await graphql.client.request(query, {
    input: {
      registrationRecord: clientRegistrationFinishResult.registrationRecord,
      mainDevice,
      serializedUserChainEvent: JSON.stringify(createChainEvent),
    },
  });
  return {
    registrationRecord: clientRegistrationFinishResult.registrationRecord,
    exportKey,
    mainDevice,
    signingPrivateKey,
    encryptionPrivateKey,
    registrationResponse,
  };
};
