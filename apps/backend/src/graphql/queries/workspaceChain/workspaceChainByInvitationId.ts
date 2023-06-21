import { AuthenticationError, UserInputError } from "apollo-server-express";
import { idArg, nonNull, queryField } from "nexus";
import { getWorkspaceChainByInvitationId } from "../../../database/workspaceChain/getWorkspaceChainByInvitationId";
import { WorkspaceChainEvent } from "../../types/workspaceChain";

export const workspaceChainByInvitationIdQuery = queryField((t) => {
  // @ts-ignore sometimes the type is defined, sometimes not
  t.connectionField("workspaceChainByInvitationId", {
    type: WorkspaceChainEvent,
    disableBackwardPagination: true,
    cursorFromNode: (node) => (node ? `${node.position}` : ""),
    additionalArgs: {
      invitationId: nonNull(idArg()),
    },
    async nodes(root, args, context) {
      if (args.first > 5000) {
        throw new UserInputError(
          "Requested too many workspace chain events. First value exceeds 5000."
        );
      }
      // We don't want random users to be able to query the workspace chain.
      // They at least should be a user so we can identify malicious behavior
      // e.g. services reading out invitation links and querying the workspace chains.
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const cursor = args.after ? { id: args.after } : undefined;
      // prisma will include the cursor if skip: 1 is not set
      // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#do-i-always-have-to-skip-1
      const skip = cursor ? 1 : undefined;
      // include one extra project to set hasNextPage value
      const take: any = args.first ? args.first + 1 : undefined;

      const workspaceChain = await getWorkspaceChainByInvitationId({
        invitationId: args.invitationId,
        cursor,
        skip,
        take,
      });
      return workspaceChain;
    },
  });
});
