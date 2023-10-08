import { LocalDevice } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { Device } from "../../../src/types/device";
import { TestContext } from "../setupGraphql";

export const query = gql`
  mutation updateWorkspaceInfo($input: UpdateWorkspaceInfoInput!) {
    updateWorkspaceInfo(input: $input) {
      workspace {
        id
        name
        infoCiphertext
        infoNonce
        infoWorkspaceKeyId
        infoWorkspaceKey {
          workspaceId
          generation
          workspaceKeyBox {
            id
            workspaceKeyId
            deviceSigningPublicKey
            creatorDeviceSigningPublicKey
            ciphertext
            nonce
            creatorDevice {
              signingPublicKey
              encryptionPublicKey
            }
          }
        }
        currentWorkspaceKey {
          id
          workspaceId
          generation
          workspaceKeyBox {
            id
            workspaceKeyId
            deviceSigningPublicKey
            creatorDeviceSigningPublicKey
            ciphertext
            nonce
            creatorDevice {
              signingPublicKey
              encryptionPublicKey
            }
          }
        }
        workspaceKeys {
          id
          workspaceId
          generation
          workspaceKeyBox {
            id
            workspaceKeyId
            deviceSigningPublicKey
            creatorDeviceSigningPublicKey
            ciphertext
            creatorDevice {
              signingPublicKey
              encryptionPublicKey
            }
          }
        }
      }
    }
  }
`;
export type Props = {
  graphql: TestContext;
  workspaceId: string;
  info: string;
  creatorDevice: LocalDevice;
  devices: Device[];
  authorizationHeader: string;
};
export const updateWorkspaceInfo = async ({
  graphql,
  workspaceId,
  info,
  creatorDevice,
  devices,
  authorizationHeader,
}: Props) => {
  const headers = { authorization: authorizationHeader };
  const infoWorkspaceKey = sodium.crypto_kdf_keygen();
  const infoNonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const infoCiphertext = sodium.crypto_secretbox_easy(
    info,
    infoNonce,
    infoWorkspaceKey
  );
  const infoWorkspaceKeyBoxes: any[] = [];
  for (const device of devices) {
    // encyrpt the workspaceKey for each device using the creatorDevice's encryptionPublicKey
    const deviceKeyBoxNonce = sodium.randombytes_buf(
      sodium.crypto_box_NONCEBYTES
    );
    const deviceKeyBoxCiphertext = sodium.crypto_box_easy(
      infoWorkspaceKey,
      deviceKeyBoxNonce,
      sodium.from_base64(device.encryptionPublicKey),
      sodium.from_base64(creatorDevice.encryptionPrivateKey)
    );
    infoWorkspaceKeyBoxes.push({
      deviceSigningPublicKey: device.signingPublicKey,
      ciphertext: sodium.to_base64(deviceKeyBoxCiphertext),
      nonce: sodium.to_base64(deviceKeyBoxNonce),
    });
  }
  const result = await graphql.client.request(
    query,
    {
      input: {
        workspaceId,
        infoCiphertext: sodium.to_base64(infoCiphertext),
        infoNonce: sodium.to_base64(infoNonce),
        creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
        infoWorkspaceKeyBoxes,
      },
    },
    headers
  );
  return result;
};
