import { AuthenticationError } from "apollo-server-express";
import { objectType, queryField } from "nexus";

export const PendingWorkspaceInvitationResult = objectType({
  name: "PendingWorkspaceInvitationResult",
  definition(t) {
    t.string("id");
    t.string("ciphertext");
    t.string("publicNonce");
    t.int("subkeyId");
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
        ciphertext: context.user.pendingWorkspaceInvitationKeyCiphertext,
        publicNonce: context.user.pendingWorkspaceInvitationKeyPublicNonce,
        subkeyId: context.user.pendingWorkspaceInvitationKeySubkeyId,
      };
    },
  });
});
