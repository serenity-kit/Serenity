import * as workspaceChain from "@serenity-kit/workspace-chain";
import {
  LocalDevice,
  constructUserFromSerializedUserChain,
} from "@serenity-tools/common";
import {
  runAuthorizeMemberMutation,
  runUnauthorizedMemberQuery,
  runWorkspaceMembersByMainDeviceSigningPublicKeyQuery,
  runWorkspaceQuery,
} from "../../generated/graphql";

export const secondsBetweenNewMemberChecks = 5;

import {
  decryptWorkspaceKey,
  encryptWorkspaceKeyForDevice,
} from "@serenity-tools/common";

export type Props = {
  activeDevice: LocalDevice;
  workspaceChainState: workspaceChain.WorkspaceChainState;
};

export const authorizeMembersIfNecessary = async ({
  activeDevice,
  workspaceChainState,
}: Props) => {
  // fails silently
  try {
    const unauthorizedMemberResult = await runUnauthorizedMemberQuery({});
    if (unauthorizedMemberResult.data?.unauthorizedMember) {
      const { workspaceId, userMainDeviceSigningPublicKey } =
        unauthorizedMemberResult.data.unauthorizedMember;

      if (
        !workspaceChainState.members.hasOwnProperty(
          userMainDeviceSigningPublicKey
        )
      ) {
        // could be that the chain is not up to date
        // possibly should be improved by warning the user after the chain was updated
        return;
      }

      const workspaceMembersByMainDeviceSigningPublicKeyQueryResult =
        await runWorkspaceMembersByMainDeviceSigningPublicKeyQuery({
          workspaceId,
          mainDeviceSigningPublicKeys: [userMainDeviceSigningPublicKey],
        });

      if (
        workspaceMembersByMainDeviceSigningPublicKeyQueryResult.data
          ?.workspaceMembersByMainDeviceSigningPublicKey?.workspaceMembers &&
        workspaceMembersByMainDeviceSigningPublicKeyQueryResult.data
          ?.workspaceMembersByMainDeviceSigningPublicKey?.workspaceMembers
          .length > 0
      ) {
        const user = constructUserFromSerializedUserChain({
          serializedUserChain:
            workspaceMembersByMainDeviceSigningPublicKeyQueryResult.data
              .workspaceMembersByMainDeviceSigningPublicKey.workspaceMembers[0]
              .user.chain,
        });

        if (
          user.mainDeviceSigningPublicKey !== userMainDeviceSigningPublicKey
        ) {
          // the server returned the wrong chain!
          return;
        }

        const workspaceResult = await runWorkspaceQuery({
          deviceSigningPublicKey: activeDevice.signingPublicKey,
          id: workspaceId,
        });

        if (workspaceResult.data?.workspace?.workspaceKeys) {
          const decryptedWorkspaceKeys =
            workspaceResult.data.workspace.workspaceKeys.map(
              (workspaceKeyData) => {
                const { workspaceKeyBox, id } = workspaceKeyData;
                if (!workspaceKeyBox) {
                  throw new Error("Missing a workspaceKeyBox");
                }
                // TODO verify that creator
                // needs a workspace key chain with a main device!
                const key = decryptWorkspaceKey({
                  ciphertext: workspaceKeyBox.ciphertext,
                  nonce: workspaceKeyBox.nonce,
                  creatorDeviceEncryptionPublicKey:
                    workspaceKeyBox.creatorDevice?.encryptionPublicKey!,
                  receiverDeviceEncryptionPrivateKey:
                    activeDevice.encryptionPrivateKey!,
                });
                return {
                  workspaceKeyId: id,
                  key,
                };
              }
            );

          const workspaceKeys = decryptedWorkspaceKeys.map(
            ({ workspaceKeyId, key }) => {
              const workspaceKeyBoxes = user.nonExpiredDevices.map(
                (receiverDevice) => {
                  const { nonce, ciphertext } = encryptWorkspaceKeyForDevice({
                    receiverDeviceEncryptionPublicKey:
                      receiverDevice.encryptionPublicKey,
                    creatorDeviceEncryptionPrivateKey:
                      activeDevice.encryptionPrivateKey,
                    workspaceKey: key,
                  });
                  return {
                    receiverDeviceSigningPublicKey:
                      receiverDevice.signingPublicKey,
                    ciphertext,
                    nonce,
                  };
                }
              );

              return {
                workspaceKeyId,
                workspaceKeyBoxes,
              };
            }
          );

          await runAuthorizeMemberMutation({
            input: {
              workspaceId,
              creatorDeviceSigningPublicKey: activeDevice.signingPublicKey,
              workspaceKeys,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
};
