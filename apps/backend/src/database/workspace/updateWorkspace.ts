import { prisma } from "../prisma";
import { Workspace, WorkspaceMember } from "../../types/workspace";

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
      // 2. update usersToWorkspaces with new member structures
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
        const membersByUserId = {};
        members.forEach(({ userId, isAdmin }) => {
          membersByUserId[userId] = {
            isAdmin,
          };
        });
        const searchingUserIds: string[] = [];
        members.forEach((member) => {
          searchingUserIds.push(member.userId);
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
          // don't delete owner from members
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
          // don't alter owner's members
          usersToWorkspacesData.push({
            userId: memberUserId,
            isAdmin: membersByUserId[memberUserId].isAdmin,
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
          // TODO: update IDs
          data: {
            name: name,
            idSignature: "TODO",
          },
        });
      } else {
        updatedWorkspace = workspace;
      }
      const rawUpdatedMembers = await prisma.usersToWorkspaces.findMany({
        where: {
          workspaceId: workspace.id,
        },
        select: {
          userId: true,
          isAdmin: true,
          user: {
            select: { username: true },
          },
        },
      });
      const updatedMembers: WorkspaceMember[] = [];
      rawUpdatedMembers.forEach((rawMember) => {
        const member = {
          userId: rawMember.userId,
          username: rawMember.user.username,
          isAdmin: rawMember.isAdmin,
        };
        updatedMembers.push(member);
      });
      const updatedWorkspaceData: Workspace = {
        id: updatedWorkspace.id,
        name: updatedWorkspace.name,
        idSignature: updatedWorkspace.idSignature,
        members: updatedMembers,
      };
      return updatedWorkspaceData;
    });
  } catch (error) {
    throw error;
  }
}
