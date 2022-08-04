import { prisma } from "../prisma";
import { v4 as uuidv4 } from "uuid";
import { WorkspaceKey, WorkspaceKeyBox } from "../../types/workspace";
import { ForbiddenError } from "apollo-server-express";

type Params = {
  userId: string;
  signingPublicKey: string;
  workspaceId: string;
  ciphertext: string;
};

export async function attachDeviceToWorkspace({
  userId,
  signingPublicKey,
  workspaceId,
  ciphertext,
}: Params): Promise<WorkspaceKey> {
  try {
    return await prisma.$transaction(async (prisma) => {
      // 1. get the workspace associated with this user if it exists
      // 2. Fetch all the workspaceKeys for this workspace
      // 3. Create a new worskpaceKeyBoxes for this signingPublicKey
      //    on all workspaceKeys for this workspace
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          workspaceId,
          userId,
        },
        include: {
          workspace: true,
        },
      });
      if (!userToWorkspace) {
        throw new ForbiddenError("Unauthorized");
      }
      const workspace = userToWorkspace.workspace;
      const workspaceKeys = await prisma.workspaceKey.findMany({
        where: {
          workspaceId: workspace.id,
        },
        orderBy: {
          generation: "desc",
        },
      });
      if (workspaceKeys.length === 0) {
        const newWorkspaceKey = await prisma.workspaceKey.create({
          data: {
            id: uuidv4(),
            workspaceId: workspace.id,
            generation: 0,
          },
        });
        workspaceKeys.push(newWorkspaceKey);
      }
      const currentWorkspaceKey = workspaceKeys[0];
      const workspaceKeyBoxes: WorkspaceKeyBox[] = [];
      workspaceKeys.forEach((workspaceKey) => {
        workspaceKeyBoxes.push({
          id: uuidv4(),
          workspaceKeyId: workspaceKey.id,
          deviceSigningPublicKey: signingPublicKey,
          ciphertext,
        });
      });
      await prisma.workspaceKeyBox.createMany({
        data: workspaceKeyBoxes,
      });

      const result = {
        ...currentWorkspaceKey,
        workspaceKeyBox: workspaceKeyBoxes[0] || undefined,
      };
      return result;
    });
  } catch (error) {
    throw error;
  }
}
