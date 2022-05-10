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
      const username = context.user.username;
      console.log({ id: args.id });
      if (args.id) {
        const workspace = await getWorkspace({
          username,
          id: args.id,
        });
      }

      const workspaces = await getWorkspaces({
        username,
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
            username: true,
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
