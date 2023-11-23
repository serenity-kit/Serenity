import {
  LocalDevice,
  VerifiedUserFromUserChain,
  constructUserFromSerializedUserChain,
  encryptWorkspaceKeyForDevice,
  equalArrayContent,
  generateId,
  notNull,
} from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { runWorkspaceMembersQuery } from "../../generated/graphql";
import { loadRemoteWorkspaceChain } from "../../store/workspaceChainStore";
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

  const { state: workspaceChainState } = await loadRemoteWorkspaceChain({
    workspaceId,
  });

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

  const validMainDeviceSigningPublicKeys = Object.keys(
    workspaceChainState.members
  );

  const verifiedUsers: VerifiedUserFromUserChain[] =
    workspaceMembersResult.data.workspaceMembers.nodes
      .filter(notNull)
      .map((member) => {
        return constructUserFromSerializedUserChain({
          serializedUserChain: member.user.chain,
          validMainDeviceSigningPublicKeys,
        });
      });

  if (
    !equalArrayContent(
      validMainDeviceSigningPublicKeys,
      verifiedUsers.map((user) => user.mainDeviceSigningPublicKey)
    )
  ) {
    throw new Error(
      "WorkspaceMembersQuery does not match up with Workspace Chain."
    );
  }

  const deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [];
  verifiedUsers.forEach((userDevicesInfo) => {
    if (userDevicesInfo.userId === userToRemoveId) return;
    userDevicesInfo.nonExpiredDevices.forEach((device) => {
      if (device.signingPublicKey === deviceToRemoveSigningPublicKey) return;
      const { ciphertext, nonce } = encryptWorkspaceKeyForDevice({
        receiverDeviceEncryptionPublicKey: device.encryptionPublicKey,
        creatorDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey,
        workspaceKey: workspaceKey.workspaceKey,
        workspaceId,
        workspaceKeyId: workspaceKey.id,
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
