import { Device } from "../../../prisma/generated/output";
import { Workspace } from "../../../src/types/workspace";
import { decryptWorkspaceKey } from "./decryptWorkspaceKey";

export type Props = {
  device: Device | { encryptionPublicKey: string };
  deviceEncryptionPrivateKey: string;
  workspace: Workspace;
};
export const getWorkspaceKeyForWorkspaceAndDevice = ({
  device,
  deviceEncryptionPrivateKey,
  workspace,
}: Props): string => {
  const workspaceKeyData = workspace.currentWorkspaceKey?.workspaceKeyBox;
  const workspaceKey = decryptWorkspaceKey({
    ciphertext: workspaceKeyData?.ciphertext!,
    nonce: workspaceKeyData?.nonce!,
    creatorDeviceEncryptionPublicKey: device.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: deviceEncryptionPrivateKey,
  });
  return workspaceKey;
};
