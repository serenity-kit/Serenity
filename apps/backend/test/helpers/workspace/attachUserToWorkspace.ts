import {
  decryptWorkspaceKey,
  Device,
  encryptWorkspaceKeyForDevice,
} from "@serenity-tools/common";
import { Role } from "../../../prisma/generated/output";
import { prisma } from "../../../src/database/prisma";
import { authorizeMember } from "../../../test/helpers/workspace/authorizeMember";
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
    workspaceId: workspace.id,
    workspaceKeyId: currentWorkspaceKey.id,
  });
  const guestUserWorkspaceKeyBoxMain = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: guestMainDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: hostWebDevice.encryptionPrivateKey,
    workspaceKey,
    workspaceId: workspace.id,
    workspaceKeyId: currentWorkspaceKey.id,
  });

  const workspaceKeys = [
    {
      workspaceKeyId: workspace.currentWorkspaceKey.id,
      workspaceKeyBoxes: [
        {
          ciphertext: guestUserWorkspaceKeyBoxMain.ciphertext,
          nonce: guestUserWorkspaceKeyBoxMain.nonce,
          receiverDeviceSigningPublicKey: guestMainDevice.signingPublicKey,
        },
      ],
    },
  ];

  if (guestWebDevice) {
    const guestUserWorkspaceKeyBoxWeb = encryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: guestWebDevice.encryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: hostWebDevice.encryptionPrivateKey,
      workspaceKey,
      workspaceId: workspace.id,
      workspaceKeyId: currentWorkspaceKey.id,
    });
    workspaceKeys[0].workspaceKeyBoxes.push({
      ciphertext: guestUserWorkspaceKeyBoxWeb.ciphertext,
      nonce: guestUserWorkspaceKeyBoxWeb.nonce,
      receiverDeviceSigningPublicKey: guestWebDevice.signingPublicKey,
    });
  }

  await authorizeMember({
    graphql,
    workspaceId: workspace.id,
    creatorDeviceSigningPublicKey: hostWebDevice.signingPublicKey,
    workspaceKeys,
    authorizationHeader: hostSessionKey,
  });
};
