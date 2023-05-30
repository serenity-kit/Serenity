import {
  decryptWorkspaceKey,
  Device,
  encryptWorkspaceKeyForDevice,
} from "@serenity-tools/common";
import { Role } from "../../../prisma/generated/output";
import { prisma } from "../../../src/database/prisma";
import { WorkspaceMemberDevices } from "../../../src/types/workspaceDevice";
import { attachDevicesToWorkspaces } from "../device/attachDevicesToWorkspaces";
import { TestContext } from "../setupGraphql";
import { acceptWorkspaceInvitation } from "./acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "./createWorkspaceInvitation";
import { getWorkspace } from "./getWorkspace";

export type Props = {
  graphql: TestContext;
  hostUserId: string;
  hostSessionKey: string;
  hostWebDevice: Device;
  guestUserId: string;
  guestSessionKey: string;
  guestMainDevice: Device;
  guestWebDevice?: Device | undefined;
  workspaceId: string;
  role: Role;
};
export const attachUserToWorkspace = async ({
  graphql,
  hostUserId,
  hostSessionKey,
  hostWebDevice,
  hostMainDevice,
  guestUserId,
  guestSessionKey,
  guestMainDevice,
  guestWebDevice,
  workspaceId,
  role,
}) => {
  const guestUser = await prisma.user.findFirst({
    where: { id: guestUserId },
  });
  if (!guestUser) {
    throw new Error("Guest user not found");
  }
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role,
    workspaceId,
    authorizationHeader: hostSessionKey,
    mainDevice: hostMainDevice,
  });
  const workspaceInvitation =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation;
  await acceptWorkspaceInvitation({
    graphql,
    invitationId: workspaceInvitation.id,
    inviteeMainDevice: guestMainDevice,
    authorizationHeader: guestSessionKey,
    invitationSigningKeyPairSeed:
      workspaceInvitationResult.invitationSigningKeyPairSeed,
  });
  const workspaceResult = await getWorkspace({
    graphql,
    workspaceId,
    deviceSigningPublicKey: hostWebDevice.signingPublicKey,
    authorizationHeader: hostSessionKey,
  });
  const workspace = workspaceResult.workspace;
  const currentWorkspaceKey = workspace.currentWorkspaceKey;
  // TODO: encrypt workspaceKeys for user2
  // get workspace key
  const workspaceKey = decryptWorkspaceKey({
    ciphertext: currentWorkspaceKey.workspaceKeyBox.ciphertext,
    nonce: currentWorkspaceKey.workspaceKeyBox.nonce,
    creatorDeviceEncryptionPublicKey:
      currentWorkspaceKey.workspaceKeyBox.creatorDevice.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: hostWebDevice.encryptionPrivateKey,
  });
  const guestUserWorkspaceKeyBoxMain = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: guestMainDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: hostWebDevice.encryptionPrivateKey,
    workspaceKey,
  });
  const workspaceMemberDevices: WorkspaceMemberDevices[] = [];
  workspaceMemberDevices.push({
    id: workspaceId,
    workspaceKeysMembers: [
      {
        id: workspace.currentWorkspaceKey.id,
        members: [
          {
            id: guestUserId,
            workspaceDevices: [
              {
                receiverDeviceSigningPublicKey:
                  guestMainDevice.signingPublicKey,
                nonce: guestUserWorkspaceKeyBoxMain.nonce,
                ciphertext: guestUserWorkspaceKeyBoxMain.ciphertext,
              },
            ],
          },
        ],
      },
    ],
  });
  if (guestWebDevice) {
    const guestUserWorkspaceKeyBoxWeb = encryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: guestWebDevice.encryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: hostWebDevice.encryptionPrivateKey,
      workspaceKey,
    });
    workspaceMemberDevices.push({
      id: workspaceId,
      workspaceKeysMembers: [
        {
          id: workspace.currentWorkspaceKey.id,
          members: [
            {
              id: guestUserId,
              workspaceDevices: [
                {
                  receiverDeviceSigningPublicKey:
                    guestWebDevice.signingPublicKey,
                  nonce: guestUserWorkspaceKeyBoxWeb.nonce,
                  ciphertext: guestUserWorkspaceKeyBoxWeb.ciphertext,
                },
              ],
            },
          ],
        },
      ],
    });
  }
  await attachDevicesToWorkspaces({
    graphql,
    creatorDeviceSigningPublicKey: hostWebDevice.signingPublicKey,
    workspaceMemberDevices,
    authorizationHeader: hostSessionKey,
  });
};
