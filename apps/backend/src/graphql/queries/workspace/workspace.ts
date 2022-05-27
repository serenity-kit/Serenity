import { idArg, queryField } from "nexus";
import { prisma } from "../../../database/prisma";
import { getWorkspace } from "../../../database/workspace/getWorkspace";
import { getWorkspaces } from "../../../database/workspace/getWorkspaces";
import { Workspace } from "../../types/workspace";
import { WorkspaceMember } from "../../../types/workspace";

export const workspaces = queryField((t) => {
  t.field("workspace", {
    type: Workspace,
    args: {
      id: idArg(),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      const userId = context.user.id;
      if (args.id) {
        const workspace = await getWorkspace({
          userId,
          id: args.id,
        });
        if (!workspace) {
          return null;
        }
        return workspace;
      }

      const workspaces = await getWorkspaces({
        userId,
        cursor: undefined,
        skip: undefined,
        take: 1,
      });
      if (workspaces.length > 0) {
        const workspace = workspaces[0];
        const rawWorkspaceMembers = await prisma.usersToWorkspaces.findMany({
          where: {
            workspaceId: workspace.id,
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
        const members: WorkspaceMember[] = [];
        rawWorkspaceMembers.forEach((workspaceMember) => {
          members.push({
            userId: workspaceMember.userId,
            username: workspaceMember.user.username,
            isAdmin: workspaceMember.isAdmin,
          });
        });
        workspace.members = members;
        return workspace;
      }
      return null;
    },
  });
});
