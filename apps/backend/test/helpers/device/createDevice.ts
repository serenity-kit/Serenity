import { gql } from "graphql-request";
import { createDevice as createdDeviceHelper } from "@serenity-tools/utils";

type Params = {
  graphql: any;
  authorizationHeader: string;
};

export const createDevice = async ({
  graphql,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation createDevice($input: CreateDeviceInput!) {
      createDevice(input: $input) {
        device {
          userId
          signingPublicKey
          encryptionPublicKey
          encryptionPublicKeySignature
        }
      }
    }
  `;

  const device = await createdDeviceHelper();

  const result = await graphql.client.request(
    query,
    {
      input: {
        encryptionPublicKeySignature: device.encryptionPublicKeySignature,
        encryptionPublicKey: device.encryptionKeyPair.publicKey,
        signingPublicKey: device.signingKeyPair.publicKey,
      },
    },
    authorizationHeaders
  );
  return result;
};
