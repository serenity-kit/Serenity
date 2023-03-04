import { equalArrayContent } from "@serenity-tools/common";
import { v4 as uuidv4 } from "uuid";
import {
  Workspace,
  WorkspaceKey,
  WorkspaceKeyBox,
  WorkspaceMember,
} from "../../types/workspace";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";

export type DeviceWorkspaceKeyBoxParams = {
  deviceSigningPublicKey: string;
  nonce: string;
  ciphertext: string;
};

type Params = {
  id: string;
  name: string;
  userId: string;
  creatorDeviceSigningPublicKey: string;
  deviceWorkspaceKeyBoxes: DeviceWorkspaceKeyBoxParams[];
  workspaceKeyId?: string | undefined;
};

export async function createWorkspace({
  id,
  name,
  userId,
  creatorDeviceSigningPublicKey,
  deviceWorkspaceKeyBoxes,
  workspaceKeyId,
}: Params): Promise<Workspace> {
  return await prisma.$transaction(async (prisma) => {
    const allDeviceSigningPublicKeys = deviceWorkspaceKeyBoxes.map(
      (workspaceKeyBox) => workspaceKeyBox.deviceSigningPublicKey
    );
    const devices = await prisma.device.findMany({
      where: {
        userId,
        session: { every: { expiresAt: { gte: new Date() } } },
      },
      select: { signingPublicKey: true },
    });
    const actualDeviceSigningPublicKeys = devices.map(
      (item) => item.signingPublicKey
    );
    if (
      !equalArrayContent(
        allDeviceSigningPublicKeys,
        actualDeviceSigningPublicKeys
      )
    ) {
      throw new Error(
        "Invalid deviceWorkspaceKeyBoxes since it doesn't match all devices of the user"
      );
    }

    const rawWorkspace = await prisma.workspace.create({
      data: {
        id,
        idSignature: "TODO",
        name,
        usersToWorkspaces: {
          create: {
            userId,
            role: "ADMIN",
            isAuthorizedMember: true,
          },
        },
        workspaceKeys: {
          create: {
            id: workspaceKeyId || uuidv4(),
            generation: 0,
          },
        },
      },
    });

    // make sure the user controls this creatorDevice
    const creatorDevice = await getOrCreateCreatorDevice({
      prisma,
      userId,
      signingPublicKey: creatorDeviceSigningPublicKey,
    });

    const currentWorkspaceKey = await prisma.workspaceKey.findFirst({
      where: {
        workspaceId: rawWorkspace.id,
      },
    });
    if (!currentWorkspaceKey) {
      throw new Error("Error fetching newly created WorkspaceKey");
    }
    const workspaceKeyBoxes: WorkspaceKeyBox[] = [];
    deviceWorkspaceKeyBoxes.forEach(
      (deviceWorkspaceKeyBox: DeviceWorkspaceKeyBoxParams) => {
        workspaceKeyBoxes.push({
          id: uuidv4(),
          workspaceKeyId: currentWorkspaceKey.id,
          ...deviceWorkspaceKeyBox,
          creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
        });
      }
    );

    await prisma.workspaceKeyBox.createMany({
      data: workspaceKeyBoxes,
    });
    const createdWorkspaceKeyBoxes = await prisma.workspaceKeyBox.findMany({
      where: {
        workspaceKeyId: currentWorkspaceKey.id,
      },
    });
    const usersToWorkspaces = await prisma.usersToWorkspaces.findMany({
      where: {
        workspaceId: rawWorkspace.id,
        userId,
      },
      select: {
        userId: true,
        role: true,
        user: {
          select: {
            username: true,
            devices: {
              select: {
                signingPublicKey: true,
                encryptionPublicKey: true,
                encryptionPublicKeySignature: true,
              },
            },
          },
        },
      },
    });
    const returningWorkspaceKey: WorkspaceKey = {
      ...currentWorkspaceKey,
      workspaceKeyBox: createdWorkspaceKeyBoxes[0],
    };
    const members: WorkspaceMember[] = [];
    usersToWorkspaces.forEach((userToWorkspace) => {
      members.push({
        userId: userToWorkspace.userId,
        username: userToWorkspace.user.username,
        role: userToWorkspace.role,
        devices: userToWorkspace.user.devices,
      });
    });
    const workspace: Workspace = {
      id: rawWorkspace.id,
      name: rawWorkspace.name,
      idSignature: rawWorkspace.idSignature,
      members,
      currentWorkspaceKey: returningWorkspaceKey,
      workspaceKeys: [returningWorkspaceKey],
    };
    return workspace;
  });
}
