import { prisma } from "../prisma";
import { v4 as uuidv4 } from "uuid";
import { WorkspaceKey } from "../../types/workspace";
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
      // 2. Fetch latest the workspaceKey for this workspace
      // 3. Create a new worskpaceKeyBox for this signingPublicKey
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
      let workspaceKey = await prisma.workspaceKey.findFirst({
        where: {
          workspaceId: workspace.id,
        },
        orderBy: {
          generation: "desc",
        },
      });
      if (!workspaceKey) {
        // create new WorkspaceKey
        const newWorkspaceKey = await prisma.workspaceKey.create({
          data: {
            id: uuidv4(),
            workspaceId: workspace.id,
            generation: 0,
          },
        });
        workspaceKey = newWorkspaceKey;
      }
      const workspaceKeyBox = await prisma.workspaceKeyBox.create({
        data: {
          workspaceKeyId: workspaceKey.id,
          deviceSigningPublicKey: signingPublicKey,
          ciphertext,
        },
      });
      return {
        ...workspaceKey,
        workspaceKeyBoxes: [workspaceKeyBox],
      };
    });
  } catch (error) {
    throw error;
  }
}
