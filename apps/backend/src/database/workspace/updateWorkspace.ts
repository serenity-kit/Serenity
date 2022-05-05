import { prisma } from "../prisma";

export type WorkspaceSharingParams = {
  username: string;
  isAdmin: boolean;
};

type Params = {
  id: string;
  name: string;
  username: string;
  permissions: WorkspaceSharingParams[];
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
  permissions,
}: Params) {
  const permissionsByUserName = {};
  permissions.forEach(({ username, isAdmin }) => {
    permissionsByUserName[username] = {
      isAdmin,
    };
  });
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
        },
      });
      if (!userToWorkspace) {
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
      const searchingUsernames: string[] = [];
      permissions.forEach((permission) => {
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
        usernames.push(actualUser.username);
      });
      await prisma.usersToWorkspaces.deleteMany({
        where: {
          workspaceId: workspace.id,
        },
      });
      const usersToWorkspacesData: UserToWorkspaceData[] = [];
      // loop through inbound data and format for database
      usernames.forEach((username) => {
        usersToWorkspacesData.push({
          username: username,
          isAdmin: permissionsByUserName[username].isAdmin,
          workspaceId: workspace.id,
        });
      });
      await prisma.usersToWorkspaces.createMany({
        data: usersToWorkspacesData,
      });
      const updatedWorkspace = await prisma.workspace.update({
        where: {
          id: workspace.id,
        },
        // TODO: update ID
        data: {
          name: name,
          idSignature: "TODO",
        },
      });
      return updatedWorkspace;
    });
  } catch (error) {
    throw Error("Invalid workspace ID");
  }
}
