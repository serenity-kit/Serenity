import { AuthenticationError, UserInputError } from "apollo-server-express";
import { queryField } from "nexus";
import { getWorkspaceMemberDevicesProofs } from "../../../database/workspace/getWorkspaceMemberDevicesProofs";
import { WorkspaceMemberDevicesProof } from "../../types/workspaceMemberDevicesProof";

export const workspaceMemberDevicesProofsQuery = queryField((t) => {
  // @ts-ignore sometimes the type is defined, sometimes not
  t.connectionField("workspaceMemberDevicesProofs", {
    type: WorkspaceMemberDevicesProof,
    disableBackwardPagination: true,
    cursorFromNode: (node) => "",
    async nodes(root, args, context) {
      if (args.first > 50) {
        throw new UserInputError(
          "Requested too many workspaceMemberDevicesProofs. First value exceeds 50."
        );
      }
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const userId = context.user.id;
      const cursor = args.after ? { id: args.after } : undefined;
      // prisma will include the cursor if skip: 1 is not set
      // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#do-i-always-have-to-skip-1
      const skip = cursor ? 1 : undefined;
      // include one extra project to set hasNextPage value
      const take: any = args.first ? args.first + 1 : undefined;
      const workspaces = await getWorkspaceMemberDevicesProofs({
        userId,
        cursor,
        skip,
        take,
      });
      return workspaces;
    },
  });
});
