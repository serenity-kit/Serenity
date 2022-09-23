import { UserInputError } from "apollo-server-express";
import { WorkspaceKey } from "../../../prisma/generated/output";
import {
  WorkspaceDeviceParing,
  WorkspaceWithWorkspaceDevicesParing,
} from "../../types/workspaceDevice";
import { prisma } from "../prisma";
import { rotateWorkspaceKey } from "../workspace/rotateWorkspaceKey";

type Params = {
  userId: string;
  newDeviceWorkspaceKeyBoxes: WorkspaceWithWorkspaceDevicesParing[];
  creatorDeviceSigningPublicKey: string;
};

export async function authorizeDevices({
  userId,
  creatorDeviceSigningPublicKey,
  newDeviceWorkspaceKeyBoxes,
}: Params): Promise<WorkspaceKey[]> {
  return await prisma.$transaction(async (prisma) => {
    // make sure the user owns the requested devices
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });
    const allUserDevices = await prisma.device.findMany({
      where: { userId },
      select: { signingPublicKey: true },
    });
    const allUserDeviceSigningPublicKeys = allUserDevices.map(
      (userDevice) => userDevice.signingPublicKey
    );
    // build a table to look up user ownership of
    // workspaces and devices
    const requestedWorkspaceIds = new Set<string>();
    const requestedDeviceSigningPublicKeys: {
      [workspaceId: string]: Set<string>;
    } = {};
    const newDeviceWorkspaceKeyBoxesWorkspaceLookup: {
      [workspaceId: string]: WorkspaceWithWorkspaceDevicesParing;
    } = {};
    const newDeviceWorkspaceKeyBoxesDeviceLookup: {
      [workspaceId: string]: {
        [signingPublicKey: string]: WorkspaceDeviceParing;
      };
    } = {};
    const allPossibleRequestedDeviceSigningPublicKeys = new Set<string>();
    newDeviceWorkspaceKeyBoxes.forEach((newDeviceWorkspaceKeyBox) => {
      const workspaceId = newDeviceWorkspaceKeyBox.id;
      requestedWorkspaceIds.add(workspaceId);
      newDeviceWorkspaceKeyBoxesWorkspaceLookup[workspaceId] =
        newDeviceWorkspaceKeyBox;
      newDeviceWorkspaceKeyBox.workspaceDevices.forEach(
        (workspaceDevicePairing) => {
          if (!(workspaceId in requestedDeviceSigningPublicKeys)) {
            requestedDeviceSigningPublicKeys[workspaceId] = new Set<string>();
          }
          requestedDeviceSigningPublicKeys[workspaceId].add(
            workspaceDevicePairing.receiverDeviceSigningPublicKey
          );
          if (!(workspaceId in newDeviceWorkspaceKeyBoxesDeviceLookup)) {
            newDeviceWorkspaceKeyBoxesDeviceLookup[workspaceId] = {};
          }
          newDeviceWorkspaceKeyBoxesDeviceLookup[workspaceId][
            workspaceDevicePairing.receiverDeviceSigningPublicKey
          ] = workspaceDevicePairing;
          allPossibleRequestedDeviceSigningPublicKeys.add(
            workspaceDevicePairing.receiverDeviceSigningPublicKey
          );
        }
      );
    });
    const deletingDeviceSigningPublicKeys: string[] = [];
    for (let userDevice of allUserDevices) {
      if (
        !allPossibleRequestedDeviceSigningPublicKeys.has(
          userDevice.signingPublicKey
        )
      ) {
        deletingDeviceSigningPublicKeys.push(userDevice.signingPublicKey);
      }
    }

    // make sure to check `isAuthorizedMember: true` because
    // the user won't be able to create keyboxes fro workspaces
    // that they don't yet have access to
    const userWorkspaces = await prisma.usersToWorkspaces.findMany({
      where: { userId },
      select: { workspaceId: true, isAuthorizedMember: true },
    });
    const verifiedDeviceWorkspaceKeyBoxes: WorkspaceWithWorkspaceDevicesParing[] =
      [];
    for (let userWorkspace of userWorkspaces) {
      const workspaceId = userWorkspace.workspaceId;
      const newDeviceWorkspaceKeyBox =
        newDeviceWorkspaceKeyBoxesWorkspaceLookup[userWorkspace.workspaceId];
      if (!newDeviceWorkspaceKeyBox) {
        throw new UserInputError(
          "Not all user workspaces are in the newDeviceWorkspaceKeyBoxes"
        );
      }
      if (
        !requestedDeviceSigningPublicKeys[workspaceId]?.has(
          user?.mainDeviceSigningPublicKey!
        )
      ) {
        throw new UserInputError(
          "mainDevice is not included in all newDeviceWorkspaceKeyBoxes"
        );
      }
      const addableDeviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [];
      for (let workspaceDevice of newDeviceWorkspaceKeyBox.workspaceDevices) {
        // userDeviceSigningPublicKeys
        if (
          allUserDeviceSigningPublicKeys.includes(
            workspaceDevice.receiverDeviceSigningPublicKey
          )
        ) {
          addableDeviceWorkspaceKeyBoxes.push(workspaceDevice);
        }
      }
      verifiedDeviceWorkspaceKeyBoxes.push({
        id: workspaceId,
        workspaceDevices: addableDeviceWorkspaceKeyBoxes,
      });
    }

    if (verifiedDeviceWorkspaceKeyBoxes.length === 0) {
      throw new UserInputError("Not enough verifiedDeviceWorkspaceKeyBoxes");
    }

    // rotate keys
    const updatedWorkspaceKeys: WorkspaceKey[] = [];
    for (let newDeviceWorkspaceKeyBox of verifiedDeviceWorkspaceKeyBoxes) {
      const workspaceId = newDeviceWorkspaceKeyBox.id;
      const addableDeviceWorkspaceKeyBoxes =
        newDeviceWorkspaceKeyBox.workspaceDevices;
      const updatedWorkspaceKey = await rotateWorkspaceKey({
        prisma,
        deviceWorkspaceKeyBoxes: addableDeviceWorkspaceKeyBoxes,
        creatorDeviceSigningPublicKey,
        workspaceId,
        userId,
      });
      updatedWorkspaceKeys.push(updatedWorkspaceKey);
    }
    // delete unmatched devices
    await prisma.device.deleteMany({
      where: {
        signingPublicKey: {
          in: deletingDeviceSigningPublicKeys,
        },
        userId,
      },
    });
    return updatedWorkspaceKeys;
  });
}
