import { prisma } from "../prisma";
import { Workspace } from "../../types/workspace";

export type WorkspaceMemberParams = {
  username: string;
  isAdmin: boolean;
};

type Params = {
  id: string;
  name: string | undefined;
  username: string;
  members: WorkspaceMemberParams[] | undefined;
};

type UserToWorkspaceData = {
  username: string;
  workspaceId: string;
  isAdmin: boolean;
};

export async function updateWorkspace({
  id,
  name,
  username,
  members,
}: Params): Promise<Workspace> {
  try {
    return await prisma.$transaction(async (prisma) => {
      // 1. retrieve workspace if owned by user
      // 2. update usersToWorkspaces with new permission structures
      // 3. update workspace
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          username: username,
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
        const permissionsByUserName = {};
        members.forEach(({ username, isAdmin }) => {
          permissionsByUserName[username] = {
            isAdmin,
          };
        });
        const searchingUsernames: string[] = [];
        members.forEach((permission) => {
          searchingUsernames.push(permission.username);
        });
        const actualUsers = await prisma.user.findMany({
          where: {
            username: {
              in: searchingUsernames,
            },
          },
          select: {
            username: true,
          },
        });
        const usernames: string[] = [];
        actualUsers.forEach((actualUser) => {
          // don't delete owner from permissions
          if (actualUser.username != username) {
            usernames.push(actualUser.username);
          }
        });
        await prisma.usersToWorkspaces.deleteMany({
          where: {
            workspaceId: workspace.id,
            username: {
              not: username,
            },
          },
        });
        /* */
        const usersToWorkspacesData: UserToWorkspaceData[] = [];
        // loop through inbound data and format for database
        usernames.forEach((memberUsername) => {
          // don't alter owner's permissions
          usersToWorkspacesData.push({
            username: memberUsername,
            isAdmin: permissionsByUserName[memberUsername].isAdmin,
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
          username: true,
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
