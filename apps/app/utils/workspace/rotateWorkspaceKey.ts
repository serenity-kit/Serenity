import {
  LocalDevice,
  constructUserFromSerializedUserChain,
  encryptWorkspaceKeyForDevice,
  generateId,
  notNull,
} from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { runWorkspaceMembersQuery } from "../../generated/graphql";
import { WorkspaceDeviceParing } from "../../types/workspaceDevice";

export type Props = {
  workspaceId: string;
  activeDevice: LocalDevice;
  userToRemoveId?: string;
  deviceToRemoveSigningPublicKey?: string;
};
export const rotateWorkspaceKey = async ({
  workspaceId,
  activeDevice,
  userToRemoveId,
  deviceToRemoveSigningPublicKey,
}: Props) => {
  const workspaceKeyString = sodium.to_base64(sodium.crypto_kdf_keygen());
  const workspaceKey = {
    id: generateId(),
    workspaceKey: workspaceKeyString,
  };

  // TODO here we should take already loaded devices into account and
  // load all of them again from the server
  let workspaceMembersResult = await runWorkspaceMembersQuery(
    { workspaceId },
    { requestPolicy: "network-only" }
  );
  if (
    !workspaceMembersResult.data?.workspaceMembers?.nodes ||
    workspaceMembersResult.data?.workspaceMembers?.nodes.length === 0
  ) {
    throw new Error("No users found for workspace");
  }

  const userDevicesInfoArray =
    workspaceMembersResult.data.workspaceMembers.nodes
      .filter(notNull)
      .map((member) => {
        return constructUserFromSerializedUserChain({
          serializedUserChain: member.user.chain,
        });
      });

  const deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [];
  userDevicesInfoArray.forEach((userDevicesInfo) => {
    if (userDevicesInfo.userId === userToRemoveId) return;
    userDevicesInfo.nonExpiredDevices.forEach((device) => {
      if (device.signingPublicKey === deviceToRemoveSigningPublicKey) return;
      const { ciphertext, nonce } = encryptWorkspaceKeyForDevice({
        receiverDeviceEncryptionPublicKey: device.encryptionPublicKey,
        creatorDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey,
        workspaceKey: workspaceKey.workspaceKey,
      });
      deviceWorkspaceKeyBoxes.push({
        ciphertext,
        nonce,
        receiverDeviceSigningPublicKey: device.signingPublicKey,
      });
    });
  });

  return {
    workspaceKey,
    deviceWorkspaceKeyBoxes,
  };
};
