import { prisma } from "../prisma";
import {
  Workspace,
  WorkspaceKey,
  WorkspaceKeyBox,
  WorkspaceMember,
} from "../../types/workspace";
import { v4 as uuidv4 } from "uuid";

type Params = {
  id: string;
  name: string;
  userId: string;
  deviceSigningPublicKey: string;
  deviceAeadCiphertext: string;
};

export async function createWorkspace({
  id,
  name,
  userId,
  deviceSigningPublicKey,
  deviceAeadCiphertext,
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
    const workspaceKeyBox: WorkspaceKeyBox =
      await prisma.workspaceKeyBox.create({
        data: {
          deviceSigningPublicKey,
          ciphertext: deviceAeadCiphertext,
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
      workspaceKeyBoxes: [workspaceKeyBox],
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
      workspaceKeys: [returningWorkspaceKey],
    };
    return workspace;
  });
}
