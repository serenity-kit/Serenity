import { LocalDevice } from "@serenity-tools/common";
import {
  runAuthorizeMemberMutation,
  runUnauthorizedMemberQuery,
  runWorkspaceQuery,
} from "../../generated/graphql";
export const secondsBetweenNewMemberChecks = 5;

import {
  decryptWorkspaceKey,
  encryptWorkspaceKeyForDevice,
} from "@serenity-tools/common";

export type Props = {
  activeDevice: LocalDevice;
};

export const authorizeMembersIfNecessary = async ({ activeDevice }: Props) => {
  // fails silently
  try {
    const unauthorizedMemberResult = await runUnauthorizedMemberQuery({});
    if (unauthorizedMemberResult.data?.unauthorizedMember) {
      const { workspaceId, devices } =
        unauthorizedMemberResult.data.unauthorizedMember;

      // TODO CHECK THAT THE USER IS AN AUTHORIZED MEMBER
      // keep in mind to get the correct workspace chain!

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
            const workspaceKeyBoxes = devices.map((receiverDevice) => {
              const { nonce, ciphertext } = encryptWorkspaceKeyForDevice({
                receiverDeviceEncryptionPublicKey:
                  receiverDevice.encryptionPublicKey,
                creatorDeviceEncryptionPrivateKey:
                  activeDevice.encryptionPrivateKey,
                workspaceKey: key,
              });
              return {
                receiverDeviceSigningPublicKey: receiverDevice.signingPublicKey,
                ciphertext,
                nonce,
              };
            });

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
  } catch (error) {
    console.error(error);
  }
};
