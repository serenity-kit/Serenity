import { v4 as uuidv4 } from "uuid";
import {
  Workspace,
  WorkspaceKey,
  WorkspaceKeyBox,
  WorkspaceMember,
} from "../../types/workspace";
import { prisma } from "../prisma";

export type DeviceWorkspaceKeyBoxParams = {
  deviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  nonce: string;
  ciphertext: string;
};

type Params = {
  id: string;
  name: string;
  userId: string;
  deviceWorkspaceKeyBoxes: DeviceWorkspaceKeyBoxParams[];
};

export async function createWorkspace({
  id,
  name,
  userId,
  deviceWorkspaceKeyBoxes,
}: Params): Promise<Workspace> {
  return await prisma.$transaction(async (prisma) => {
    const rawWorkspace = await prisma.workspace.create({
      data: {
        id,
        idSignature: "TODO",
        name,
        usersToWorkspaces: {
          create: {
            userId,
            isAdmin: true,
            isAuthorizedMember: true,
          },
        },
        workspaceKey: {
          create: {
            id: uuidv4(),
            generation: 0,
          },
        },
      },
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
        isAdmin: true,
        user: {
          select: {
            username: true,
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
        isAdmin: userToWorkspace.isAdmin,
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
