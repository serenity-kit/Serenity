import { ForbiddenError } from "apollo-server-express";
import { v4 as uuidv4 } from "uuid";
import { WorkspaceKey, WorkspaceKeyBox } from "../../types/workspace";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";

export type WorkspaceKeyDevicePair = {
  workspaceKeyId: string;
  nonce: string;
  ciphertext: string;
};

export type AttachToDeviceWorkspaceKeyBoxData = {
  workspaceId: string;
  workspaceKeyDevicePairs: WorkspaceKeyDevicePair[];
};

type Params = {
  userId: string;
  receiverDeviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  workspaceKeyBoxes: AttachToDeviceWorkspaceKeyBoxData[];
};

export async function attachDeviceToWorkspaces({
  userId,
  receiverDeviceSigningPublicKey,
  creatorDeviceSigningPublicKey,
  workspaceKeyBoxes,
}: Params): Promise<WorkspaceKey[]> {
  const workspaceKeyBoxLookup: {
    [workspaceId: string]: AttachToDeviceWorkspaceKeyBoxData;
  } = {};
  const workspaceIds: string[] = [];
  workspaceKeyBoxes.forEach((workspaceKeyBox) => {
    workspaceKeyBoxLookup[workspaceKeyBox.workspaceId] = workspaceKeyBox;
    workspaceIds.push(workspaceKeyBox.workspaceId);
  });
  try {
    return await prisma.$transaction(async (prisma) => {
      // 1. get the workspaces associated with this user
      // 2. Add any missing workspaceKeys
      // 3. Find any existing workspaceKeyBoxes matching this device signingPublicKey
      // 4. Create a new worskpaceKeyBoxes for this signingPublicKey
      //    on all workspaceKeys for the user's workspaces
      const userToWorkspaces = await prisma.usersToWorkspaces.findMany({
        where: {
          workspaceId: {
            in: workspaceIds,
          },
          userId,
        },
        include: {
          workspace: {
            include: {
              workspaceKey: {
                orderBy: {
                  generation: "desc",
                },
              },
            },
          },
        },
      });

      // make sure this device belongs to a user that is part of this workspace
      const verifiedDevice = await prisma.device.findFirst({
        where: { signingPublicKey: receiverDeviceSigningPublicKey },
      });
      if (!verifiedDevice || !verifiedDevice.userId) {
        throw new ForbiddenError("Unauthorized");
      }
      const verifiedDeviceWorkspaces = await prisma.usersToWorkspaces.findMany({
        where: {
          userId: verifiedDevice.userId,
          workspaceId: { in: workspaceIds },
        },
      });
      if (verifiedDeviceWorkspaces.length === 0) {
        throw new ForbiddenError("Unauthorized");
      }
      // make sure the user controls this creatorDevice
      await getOrCreateCreatorDevice({
        prisma,
        userId,
        signingPublicKey: creatorDeviceSigningPublicKey,
      });
      const userWorkspaceIds: string[] = [];
      const newWorkspaceKeys: WorkspaceKey[] = [];
      userToWorkspaces.forEach(async (userToWorkspace) => {
        userWorkspaceIds.push(userToWorkspace.workspaceId);
        const workspace = userToWorkspace.workspace;
        const workspaceKeys = workspace.workspaceKey;
        if (workspaceKeys.length === 0) {
          newWorkspaceKeys.push({
            id: uuidv4(),
            workspaceId: workspace.id,
            generation: 0,
          });
        }
      });
      await prisma.workspaceKey.createMany({
        data: newWorkspaceKeys,
      });
      const verifiedWorkspaceIds: string[] = [];
      verifiedDeviceWorkspaces.forEach((userToWorkspace) => {
        verifiedWorkspaceIds.push(userToWorkspace.workspaceId);
      });
      const workspaces = await prisma.workspace.findMany({
        where: { id: { in: verifiedWorkspaceIds } },
        include: {
          workspaceKey: {
            include: {
              workspaceKeyBoxes: {
                include: {
                  creatorDevice: true,
                },
              },
            },
            orderBy: {
              generation: "desc",
            },
          },
        },
      });
      const existingWorkspaceKeyBoxes = await prisma.workspaceKeyBox.findMany({
        where: {
          deviceSigningPublicKey: receiverDeviceSigningPublicKey,
          workspaceKey: { workspaceId: { in: workspaceIds } },
        },
      });
      const existingWorkspaceKeyBoxLookup: {
        [workspaceKeyId: string]: WorkspaceKeyBox;
      } = {};
      existingWorkspaceKeyBoxes.forEach((workspaceKeyBox) => {
        existingWorkspaceKeyBoxLookup[workspaceKeyBox.workspaceKeyId] =
          workspaceKeyBox;
      });
      const workspaceKeyBoxes: WorkspaceKeyBox[] = [];
      workspaces.forEach((workspace) => {
        // const workspaceKey = workspace.workspaceKey[0];
        const currentWorkspaceKeyBoxData = workspaceKeyBoxLookup[workspace.id];
        currentWorkspaceKeyBoxData.workspaceKeyDevicePairs.forEach(
          (workspaceKeyDevicePair) => {
            const workspaceKeyId = workspaceKeyDevicePair.workspaceKeyId;
            if (!(workspaceKeyId in existingWorkspaceKeyBoxLookup)) {
              workspaceKeyBoxes.push({
                id: uuidv4(),
                workspaceKeyId: workspaceKeyId,
                deviceSigningPublicKey: receiverDeviceSigningPublicKey,
                creatorDeviceSigningPublicKey,
                nonce: workspaceKeyDevicePair.nonce,
                ciphertext: workspaceKeyDevicePair.ciphertext,
              });
            }
          }
        );
      });
      await prisma.workspaceKeyBox.createMany({
        data: workspaceKeyBoxes,
      });
      const rawWorkspaceKeys = await prisma.workspaceKey.findMany({
        where: { workspaceId: { in: userWorkspaceIds } },
        include: {
          workspaceKeyBoxes: {
            where: { deviceSigningPublicKey: receiverDeviceSigningPublicKey },
          },
        },
        orderBy: { generation: "desc" },
      });
      const workspaceKeys: WorkspaceKey[] = [];
      rawWorkspaceKeys.forEach(({ workspaceKeyBoxes, ...workspaceKey }) => {
        workspaceKeys.push({
          ...workspaceKey,
          workspaceKeyBox: workspaceKeyBoxes[0],
        });
      });
      return workspaceKeys;
    });
  } catch (error) {
    throw error;
  }
}
