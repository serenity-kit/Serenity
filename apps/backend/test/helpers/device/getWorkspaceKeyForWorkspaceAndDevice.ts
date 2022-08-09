import { Device } from "../../../prisma/generated/output";
import { Workspace } from "../../../src/types/workspace";
import { decryptWorkspaceKey } from "./decryptWorkspaceKey";

export type Props = {
  device: Device | { encryptionPublicKey: string };
  deviceEncryptionPrivateKey: string;
  workspace: Workspace;
};
export const getWorkspaceKeyForWorkspaceAndDevice = async ({
  device,
  deviceEncryptionPrivateKey,
  workspace,
}: Props): Promise<string> => {
  const workspaceKeyData = workspace.currentWorkspaceKey?.workspaceKeyBox;
  const workspaceKey = await decryptWorkspaceKey({
    ciphertext: workspaceKeyData?.ciphertext!,
    nonce: workspaceKeyData?.nonce!,
    creatorDeviceEncryptionPublicKey: device.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: deviceEncryptionPrivateKey,
  });
  return workspaceKey;
};
