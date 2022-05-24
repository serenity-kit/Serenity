import { idArg, queryField } from "nexus";
import { prisma } from "../../../database/prisma";
import { getWorkspace } from "../../../database/workspace/getWorkspace";
import { getWorkspaces } from "../../../database/workspace/getWorkspaces";
import { Workspace } from "../../types/workspace";

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
        const rawWorkspace = await getWorkspace({
          userId,
          id: args.id,
        });
        if (!rawWorkspace) {
          return null;
        }
        const workspace = {
          id: rawWorkspace.id,
          name: rawWorkspace.name,
          idSignature: rawWorkspace.idSignature,
          members: rawWorkspace.usersToWorkspaces,
        };
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
        const members = await prisma.usersToWorkspaces.findMany({
          where: {
            workspaceId: workspace.id,
          },
          select: {
            userId: true,
            isAdmin: true,
          },
        });
        workspace.members = members;
        return workspace;
      }
      return null;
    },
  });
});
