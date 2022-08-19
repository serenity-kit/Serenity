import { AuthenticationError, UserInputError } from "apollo-server-express";
import { idArg, nonNull, queryField, stringArg } from "nexus";
import { prisma } from "../../../database/prisma";
import { getWorkspace } from "../../../database/workspace/getWorkspace";
import { getWorkspaces } from "../../../database/workspace/getWorkspaces";
import { WorkspaceMember } from "../../../types/workspace";
import { Workspace } from "../../types/workspace";

export const workspaces = queryField((t) => {
  t.field("workspace", {
    type: Workspace,
    args: {
      id: idArg(),
      deviceSigningPublicKey: nonNull(stringArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      if (!args.deviceSigningPublicKey) {
        throw new UserInputError(
          "Invalid input: deviceSigningPublicKey cannot be null"
        );
      }
      const userId = context.user.id;
      if (args.id) {
        const workspace = await getWorkspace({
          userId,
          id: args.id,
          deviceSigningPublicKey: args.deviceSigningPublicKey,
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
        deviceSigningPublicKey: args.deviceSigningPublicKey,
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
