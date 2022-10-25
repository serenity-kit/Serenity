import { createAndEncryptDevice } from "@serenity-tools/common";
import { Registration } from "@serenity-tools/opaque-server";
import { gql } from "graphql-request";
import sodium from "libsodium-wrappers";

export type Props = {
  graphql: any;
  challengeResponse: string;
  registrationId: string;
  registration: Registration;
};
export const finalizeRegistration = async ({
  graphql,
  challengeResponse,
  registrationId,
  registration,
}: Props) => {
  const message = registration.finish(sodium.from_base64(challengeResponse));
  const query = gql`
    mutation finishRegistration($input: FinishRegistrationInput!) {
      finishRegistration(input: $input) {
        id
      }
    }
  `;

  const exportKey = registration.getExportKey();
  const { signingPrivateKey, encryptionPrivateKey, ...mainDevice } =
    await createAndEncryptDevice(sodium.to_base64(exportKey));

  const registrationResponse = await graphql.client.request(query, {
    input: {
      registrationId,
      message: sodium.to_base64(message),
      mainDevice,
    },
  });
  return {
    message,
    exportKey,
    mainDevice,
    signingPrivateKey,
    encryptionPrivateKey,
    registrationResponse,
  };
};