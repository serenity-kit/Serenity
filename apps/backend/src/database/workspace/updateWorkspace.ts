import { prisma } from "../prisma";
import { Workspace } from "../../types/workspace";

export type WorkspaceMemberParams = {
  userId: string;
  isAdmin: boolean;
};

type Params = {
  id: string;
  name: string | undefined;
  userId: string;
  members: WorkspaceMemberParams[] | undefined;
};

type UserToWorkspaceData = {
  userId: string;
  workspaceId: string;
  isAdmin: boolean;
};

export async function updateWorkspace({
  id,
  name,
  userId,
  members,
}: Params): Promise<Workspace> {
  try {
    return await prisma.$transaction(async (prisma) => {
      // 1. retrieve workspace if owned by user
      // 2. update usersToWorkspaces with new permission structures
      // 3. update workspace
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          userId,
          isAdmin: true,
          workspaceId: id,
        },
        select: {
          workspaceId: true,
          isAdmin: true,
        },
      });
      if (!userToWorkspace || !userToWorkspace.isAdmin) {
        throw new Error("Unauthorized");
      }
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: userToWorkspace.workspaceId,
        },
      });
      if (!workspace) {
        throw new Error("Invalid workspace ID");
      }
      if (members != undefined) {
        const permissionsByUserId = {};
        members.forEach(({ userId, isAdmin }) => {
          permissionsByUserId[userId] = {
            isAdmin,
          };
        });
        const searchingUserIds: string[] = [];
        members.forEach((permission) => {
          searchingUserIds.push(permission.userId);
        });
        const actualUsers = await prisma.user.findMany({
          where: {
            id: {
              in: searchingUserIds,
            },
          },
          select: {
            id: true,
          },
        });
        const userIds: string[] = [];
        actualUsers.forEach((actualUser) => {
          // don't delete owner from permissions
          if (actualUser.id != userId) {
            userIds.push(actualUser.id);
          }
        });
        await prisma.usersToWorkspaces.deleteMany({
          where: {
            workspaceId: workspace.id,
            userId: {
              not: userId,
            },
          },
        });
        /* */
        const usersToWorkspacesData: UserToWorkspaceData[] = [];
        // loop through inbound data and format for database
        userIds.forEach((memberUserId) => {
          // don't alter owner's permissions
          usersToWorkspacesData.push({
            userId: memberUserId,
            isAdmin: permissionsByUserId[memberUserId].isAdmin,
            workspaceId: workspace.id,
          });
        });
        await prisma.usersToWorkspaces.createMany({
          data: usersToWorkspacesData,
        });
        /* */
      }
      let updatedWorkspace: any;
      if (name != undefined) {
        updatedWorkspace = await prisma.workspace.update({
          where: {
            id: workspace.id,
          },
          // TODO: update ID
          data: {
            name: name,
            idSignature: "TODO",
          },
        });
      } else {
        updatedWorkspace = workspace;
      }
      const updatedPermissions = await prisma.usersToWorkspaces.findMany({
        where: {
          workspaceId: workspace.id,
        },
        select: {
          userId: true,
          isAdmin: true,
        },
      });
      const updatedWorkspaceData: Workspace = {
        id: updatedWorkspace.id,
        name: updatedWorkspace.name,
        idSignature: updatedWorkspace.idSignature,
        members: updatedPermissions,
      };
      return updatedWorkspaceData;
    });
  } catch (error) {
    throw error;
  }
}
