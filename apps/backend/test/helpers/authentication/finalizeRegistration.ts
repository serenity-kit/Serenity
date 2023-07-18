import { client } from "@serenity-kit/opaque";
import { createAndEncryptDevice } from "@serenity-tools/common";
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
    createAndEncryptDevice(sodium.to_base64(exportKey));

  const registrationResponse = await graphql.client.request(query, {
    input: {
      message: clientRegistrationFinishResult.registrationRecord,
      username,
      mainDevice,
    },
  });
  return {
    message: clientRegistrationFinishResult.registrationRecord,
    exportKey,
    mainDevice,
    signingPrivateKey,
    encryptionPrivateKey,
    registrationResponse,
  };
};
