import { ForbiddenError, UserInputError } from "apollo-server-express";
import { WorkspaceDeviceParing } from "../../types/workspaceDevice";
import { prisma } from "../prisma";
import { removeStaleWorkspaceKeys } from "./removeStaleWorkspaceKeys";
import { rotateWorkspaceKey } from "./rotateWorkspaceKey";

export type Props = {
  newDeviceWorkspaceKeyBoxes: WorkspaceDeviceParing[];
  creatorDeviceSigningPublicKey: string;
  workspaceId: string;
  revokedUserIds: string[];
  userId: string;
};

export const removeMembersAndRotateWorkspaceKey = async ({
  userId,
  revokedUserIds,
  workspaceId,
  creatorDeviceSigningPublicKey,
  newDeviceWorkspaceKeyBoxes,
}) => {
  return await prisma.$transaction(async (prisma) => {
    // verify user owns workspace
    if (revokedUserIds.includes(userId)) {
      throw new UserInputError("Cannot remove yourself from a workspace");
    }
    const verifiedUserWorskpace = await prisma.usersToWorkspaces.findFirst({
      where: { userId, workspaceId, isAdmin: true, isAuthorizedMember: true },
      select: { workspaceId: true },
    });
    if (!verifiedUserWorskpace) {
      throw new ForbiddenError("Unauthorized");
    }
    // verify user owns creatorsignigpublickey
    const verifiedCreatorDevice = await prisma.device.findFirst({
      where: { userId, signingPublicKey: creatorDeviceSigningPublicKey },
    });
    if (!verifiedCreatorDevice) {
      throw new UserInputError("Invalid creatorDeviceSigningPublicKey");
    }
    // add only devices which will belong to this workspace
    const allowedUsers = await prisma.usersToWorkspaces.findMany({
      where: { workspaceId, userId: { notIn: revokedUserIds } },
      select: { userId: true },
    });
    const allowedUserIds = allowedUsers.map(
      (userToWorkspace) => userToWorkspace.userId
    );

    const deviceKeyBoxLookup: {
      [sigingPublicKey: string]: WorkspaceDeviceParing;
    } = {};
    const requestedDeviceSigningPublicKeys: string[] = [];
    newDeviceWorkspaceKeyBoxes.forEach(
      (deviceKeyBox: WorkspaceDeviceParing) => {
        requestedDeviceSigningPublicKeys.push(
          deviceKeyBox.receiverDeviceSigningPublicKey
        );
        deviceKeyBoxLookup[deviceKeyBox.receiverDeviceSigningPublicKey] =
          deviceKeyBox;
      }
    );
    const addableDevices = await prisma.device.findMany({
      where: {
        userId: { in: allowedUserIds },
        signingPublicKey: { in: requestedDeviceSigningPublicKeys },
      },
      select: { signingPublicKey: true },
    });
    const addableDeviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [];
    addableDevices.forEach((device) => {
      const deviceKeyBox = deviceKeyBoxLookup[device.signingPublicKey];
      addableDeviceWorkspaceKeyBoxes.push({
        ciphertext: deviceKeyBox.ciphertext,
        nonce: deviceKeyBox.nonce,
        receiverDeviceSigningPublicKey:
          deviceKeyBox.receiverDeviceSigningPublicKey,
      });
    });
    // remove workspaceKeyBoxes for revoked users
    const revokedUserDevices = await prisma.device.findMany({
      where: { userId: { in: revokedUserIds } },
      select: { signingPublicKey: true },
    });
    const revokedUserDeviceSigningPublicKeys = revokedUserDevices.map(
      (device) => device.signingPublicKey
    );
    await prisma.workspaceKeyBox.deleteMany({
      where: {
        workspaceKey: { workspaceId },
        deviceSigningPublicKey: {
          in: revokedUserDeviceSigningPublicKeys,
        },
      },
    });
    // remove user from workspace
    await prisma.usersToWorkspaces.deleteMany({
      where: { workspaceId, userId: { in: revokedUserIds } },
    });
    // rotate keys
    const updatedWorkspaceKey = await rotateWorkspaceKey({
      prisma,
      deviceWorkspaceKeyBoxes: addableDeviceWorkspaceKeyBoxes,
      creatorDeviceSigningPublicKey,
      workspaceId,
      userId,
    });
    await removeStaleWorkspaceKeys({
      prisma,
      userId,
      workspaceIds: [workspaceId],
    });
    return updatedWorkspaceKey;
  });
};
