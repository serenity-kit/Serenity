import { AuthenticationError } from "apollo-server-express";
import { queryField, objectType } from "nexus";

export const PendingWorkspaceInvitationResult = objectType({
  name: "PendingWorkspaceInvitationResult",
  definition(t) {
    t.string("id");
  },
});

export const pendingWorkspaceInvitationQuery = queryField((t) => {
  t.field("pendingWorkspaceInvitation", {
    type: PendingWorkspaceInvitationResult,
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      return {
        id: context.user.pendingWorkspaceInvitationId,
      };
    },
  });
});
