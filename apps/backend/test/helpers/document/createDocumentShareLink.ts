import { createDevice } from "@serenity-tools/common";
import sodiumOld, { to_base64 } from "@serenity-tools/libsodium";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { Role } from "../../../prisma/generated/output";
import { SnapshotDeviceKeyBox } from "../../../src/database/document/createDocumentShareLink";
import { Device } from "../../../src/types/device";

export type Params = {
  graphql: any;
  documentId: string;
  sharingRole: Role;
  creatorDevice: Device;
  creatorDeviceEncryptionPrivateKey: string;
  snapshotKey: string;
  authorizationHeader: string;
};

export const createDocumentShareLink = async ({
  graphql,
  documentId,
  sharingRole,
  creatorDevice,
  creatorDeviceEncryptionPrivateKey,
  snapshotKey,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const virtualDevice = createDevice();

  // create virtual device
  const virtualDeviceKey = sodium.crypto_secretbox_keygen();

  // encrypt virtual device
  const serializedVirtualDevice = JSON.stringify(virtualDevice);
  const deviceSecretBoxNonce = sodium.randombytes_buf(
    sodiumOld.crypto_secretbox_NONCEBYTES
  );
  const deviceSecretBoxCiphertext = sodium.crypto_secretbox_easy(
    serializedVirtualDevice,
    deviceSecretBoxNonce,
    virtualDeviceKey
  );

  const snapshotDeviceNonce = await sodiumOld.randombytes_buf(
    sodiumOld.crypto_secretbox_NONCEBYTES
  );
  const snapshotDeviceCiphertext = sodiumOld.crypto_box_easy(
    snapshotKey,
    snapshotDeviceNonce,
    virtualDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey
  );
  const snapshotDeviceKeyBox: SnapshotDeviceKeyBox = {
    ciphertext: snapshotDeviceCiphertext,
    nonce: snapshotDeviceNonce,
    deviceSigningPublicKey: virtualDevice.signingPublicKey,
  };

  const query = gql`
    mutation createDocumentShareLink($input: CreateDocumentShareLinkInput!) {
      createDocumentShareLink(input: $input) {
        token
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        documentId,
        sharingRole,
        deviceSecretBoxCiphertext: to_base64(deviceSecretBoxCiphertext),
        deviceSecretBoxNonce: to_base64(deviceSecretBoxNonce),
        creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
        snapshotDeviceKeyBox,
        deviceSigningPublicKey: virtualDevice.signingPublicKey,
        deviceEncryptionPublicKey: virtualDevice.encryptionPublicKey,
        deviceEncryptionPublicKeySignature:
          virtualDevice.encryptionPublicKeySignature,
      },
    },
    authorizationHeaders
  );
  return result;
};
