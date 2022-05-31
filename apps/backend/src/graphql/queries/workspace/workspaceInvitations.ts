import { idArg, nonNull, queryField } from "nexus";
import { getWorkspaceInvitations } from "../../../database/workspace/getWorkspaceInvitations";
import { WorkspaceInvitation } from "../../types/workspace";

export const workspaceInvitations = queryField((t) => {
  // @ts-ignore sometimes the type is defined, sometimes not
  t.connectionField("workspaceInvitations", {
    type: WorkspaceInvitation,
    disableBackwardPagination: true,
    cursorFromNode: (node) => node?.id ?? "",
    additionalArgs: {
      workspaceId: nonNull(idArg()),
    },
    async nodes(root, args, context) {
      if (args.first > 50) {
        throw new Error(
          "Requested too many workspace invitations. First value exceeds 50."
        );
      }
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      const userId = context.user.id;
      const cursor = args.after ? { id: args.after } : undefined;
      // prisma will include the cursor if skip: 1 is not set
      // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#do-i-always-have-to-skip-1
      const skip = cursor ? 1 : undefined;
      // include one extra project to set hasNextPage value
      const take: any = args.first ? args.first + 1 : undefined;
      const workspaceId = args.workspaceId;

      const workspaces = await getWorkspaceInvitations({
        userId,
        workspaceId,
        cursor,
        skip,
        take,
      });
      return workspaces;
    },
  });
});
