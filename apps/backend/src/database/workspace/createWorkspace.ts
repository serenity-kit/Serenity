import * as workspaceChain from "@serenity-kit/workspace-chain";
import { equalArrayContent, generateId } from "@serenity-tools/common";
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
  workspaceChainEvent: workspaceChain.CreateChainWorkspaceChainEvent;
};

export async function createWorkspace({
  id,
  name,
  userId,
  creatorDeviceSigningPublicKey,
  deviceWorkspaceKeyBoxes,
  workspaceKeyId,
  workspaceChainEvent,
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
            id: workspaceKeyId || generateId(),
            generation: 0,
          },
        },
      },
      include: {
        infoWorkspaceKey: {
          include: {
            workspaceKeyBoxes: {
              where: {
                deviceSigningPublicKey: creatorDeviceSigningPublicKey,
              },
              include: {
                creatorDevice: true,
              },
            },
          },
        },
      },
    });

    const workspaceChainState = workspaceChain.resolveState([
      workspaceChainEvent,
    ]);

    await prisma.workspaceChainEvent.create({
      data: {
        content: workspaceChainEvent,
        state: workspaceChainState,
        workspaceId: rawWorkspace.id,
        position: 0,
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
          id: generateId(),
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
      include: {
        creatorDevice: true,
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
            mainDeviceSigningPublicKey: true,
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
        devices: userToWorkspace.user.devices,
        mainDeviceSigningPublicKey:
          userToWorkspace.user.mainDeviceSigningPublicKey,
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
