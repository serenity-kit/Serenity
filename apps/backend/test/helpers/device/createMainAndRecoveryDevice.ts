import { gql } from "graphql-request";

type Params = {
  graphql: any;
  authorizationHeader: string;
};

export const createMainAndRecoveryDevice = async ({
  graphql,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation createMainAndRecoveryDevice {
      createMainAndRecoveryDevice {
        mainDevice {
          userId
          signingPublicKey
          signingPrivateKey
          signingKeyType
          encryptionPublicKey
          encryptionPrivateKey
          encryptionKeyType
          encryptionPublicKeySignature
        }
        recoveryDevice {
          userId
          ciphertext
          nonce
          deviceSigningPublicKey
          deviceSigningPrivateKey
          deviceSigningKeyType
          deviceEncryptionPublicKey
          deviceEncryptionPrivateKey
          deviceEncryptionKeyType
          signatureForMainDeviceSigningPublicKey
          signatureForRecoveryDeviceSigningPublicKey
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    null,
    authorizationHeaders
  );
  return result;
};
