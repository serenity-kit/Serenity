import { decryptWorkspaceKey } from "@serenity-tools/common";
import { Device } from "../../../prisma/generated/output";
import { Workspace } from "../../../src/types/workspace";

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
    workspaceId: workspace.id,
    workspaceKeyId: workspace.currentWorkspaceKey?.id!,
  });
  return workspaceKey;
};
