import { AuthenticationError, UserInputError } from "apollo-server-express";
import { idArg, nonNull, queryField } from "nexus";
import { getWorkspaceMembers } from "../../../database/workspace/getWorkspaceMembers";
import { WorkspaceMember } from "../../types/workspace";

export const workspaceMembersQuery = queryField((t) => {
  // @ts-ignore sometimes the type is defined, sometimes not
  t.connectionField("workspaceMembers", {
    type: WorkspaceMember,
    disableBackwardPagination: true,
    cursorFromNode: (node) => {
      if (node?.id) return node.id;
      throw new Error("Missing id on WorkspaceMember");
    },
    additionalArgs: {
      workspaceId: nonNull(idArg()),
    },
    async nodes(root, args, context) {
      if (args.first > 500) {
        throw new UserInputError(
          "Requested too many devices. First value exceeds 500."
        );
      }
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const cursor = args.after ? { userId: args.after } : undefined;
      // prisma will include the cursor if skip: 1 is not set
      // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#do-i-always-have-to-skip-1
      const skip = cursor ? 1 : undefined;
      // include one extra project to set hasNextPage value
      const take: any = args.first ? args.first + 1 : undefined;

      const members = await getWorkspaceMembers({
        userId: context.user.id,
        workspaceId: args.workspaceId,
        cursor,
        skip,
        take,
      });
      return members;
    },
  });
});
