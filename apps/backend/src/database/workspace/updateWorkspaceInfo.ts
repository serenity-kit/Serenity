import { generateId } from "@serenity-tools/common";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Role } from "../../../prisma/generated/output";
import { WorkspaceKeyBox, formatWorkspace } from "../../types/workspace";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";

export type InfoWorkspaceKeyBoxParam = {
  deviceSigningPublicKey: string;
  ciphertext: string;
  nonce: string;
};

type Params = {
  workspaceId: string;
  infoCiphertext: string;
  infoNonce: string;
  infoWorkspaceKeyBoxes: InfoWorkspaceKeyBoxParam[];
  creatorDeviceSigningPublicKey: string;
  sessionDeviceSigningPublicKey: string;
  userId: string;
};

export async function updateWorkspaceInfo({
  workspaceId,
  infoCiphertext,
  infoNonce,
  infoWorkspaceKeyBoxes,
  creatorDeviceSigningPublicKey,
  sessionDeviceSigningPublicKey,
  userId,
}: Params) {
  return await prisma.$transaction(async (prisma) => {
    const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
      where: { userId, role: Role.ADMIN, workspaceId },
      select: { workspaceId: true, role: true },
    });
    if (!userToWorkspace || !userToWorkspace.role) {
      throw new ForbiddenError("Unauthorized");
    }
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: userToWorkspace.workspaceId,
      },
      select: { id: true, infoWorkspaceKey: true },
    });
    if (!workspace) {
      throw new UserInputError("Invalid workspaceId");
    }
    const creatorDevice = await getOrCreateCreatorDevice({
      prisma,
      userId,
      signingPublicKey: creatorDeviceSigningPublicKey,
    });

    let nextGeneration = 0;
    if (workspace.infoWorkspaceKey) {
      nextGeneration = workspace.infoWorkspaceKey.generation + 1;
    }
    const infoWorkspaceKeyId = generateId();
    const insertedWorkspaceKey = await prisma.workspaceKey.create({
      data: {
        id: infoWorkspaceKeyId,
        workspaceId: workspace.id,
        generation: nextGeneration,
      },
    });
    // make sure user's main device is included in the list of devices
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mainDeviceSigningPublicKey: true },
    });
    if (!user) {
      throw new UserInputError("Invalid user");
    }
    let isUserMainDeviceIncluded = false;
    let isSessionDeviceIncluded = false;
    const workspaceKeyBoxesToInsert: WorkspaceKeyBox[] = [];
    infoWorkspaceKeyBoxes.forEach((workspaceKeyBox) => {
      if (
        !isUserMainDeviceIncluded &&
        workspaceKeyBox.deviceSigningPublicKey ===
          user.mainDeviceSigningPublicKey
      ) {
        isUserMainDeviceIncluded = true;
      }
      if (
        !isSessionDeviceIncluded &&
        workspaceKeyBox.deviceSigningPublicKey === sessionDeviceSigningPublicKey
      ) {
        isSessionDeviceIncluded = true;
      }
      workspaceKeyBoxesToInsert.push({
        id: generateId(),
        workspaceKeyId: insertedWorkspaceKey.id,
        deviceSigningPublicKey: workspaceKeyBox.deviceSigningPublicKey,
        ciphertext: workspaceKeyBox.ciphertext,
        nonce: workspaceKeyBox.nonce,
        creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
      });
    });
    if (!isUserMainDeviceIncluded) {
      throw new UserInputError(
        "User's main device is not included in the infoWorkspaceKeyBoxes"
      );
    }
    if (!isSessionDeviceIncluded) {
      throw new UserInputError(
        "Session device is not included in the infoWorkspaceKeyBoxes"
      );
    }
    await prisma.workspaceKeyBox.createMany({
      data: workspaceKeyBoxesToInsert,
    });
    const updatedWorkspace = await prisma.workspace.update({
      where: {
        id: workspace.id,
      },
      data: {
        name: "Updated name",
        infoCiphertext,
        infoNonce,
        infoWorkspaceKeyId: insertedWorkspaceKey.id,
      },
      include: {
        infoWorkspaceKey: {
          include: {
            workspaceKeyBoxes: {
              where: {
                deviceSigningPublicKey: sessionDeviceSigningPublicKey,
              },
              include: {
                creatorDevice: true,
              },
            },
          },
        },
        workspaceKeys: {
          include: {
            workspaceKeyBoxes: {
              where: {
                deviceSigningPublicKey: sessionDeviceSigningPublicKey,
              },
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
    return formatWorkspace(updatedWorkspace);
  });
}
