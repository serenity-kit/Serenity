import sodium from "react-native-libsodium";
import { encryptWorkspaceKeyForDevice } from "../encryptWorkspaceKeyForDevice/encryptWorkspaceKeyForDevice";

type Props = {
  receiverDeviceEncryptionPublicKey: string;
  creatorDeviceEncryptionPrivateKey: string;
  workspaceKeyId: string;
  workspaceId: string;
};
export const createAndEncryptWorkspaceKeyForDevice = ({
  receiverDeviceEncryptionPublicKey,
  creatorDeviceEncryptionPrivateKey,
  workspaceId,
  workspaceKeyId,
}: Props) => {
  const workspaceKey = sodium.to_base64(sodium.crypto_kdf_keygen());

  const { ciphertext, nonce } = encryptWorkspaceKeyForDevice({
    creatorDeviceEncryptionPrivateKey,
    receiverDeviceEncryptionPublicKey,
    workspaceId,
    workspaceKeyId,
    workspaceKey,
  });
  return {
    workspaceKey,
    nonce,
    ciphertext,
  };
};
