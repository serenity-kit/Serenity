import { AuthenticationError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { acceptWorkspaceInvitation } from "../../../database/workspace/acceptWorkspaceInvitation";
import { Workspace } from "../../types/workspace";

export const AcceptWorkspaceInvitationInput = inputObjectType({
  name: "AcceptWorkspaceInvitationInput",
  definition(t) {
    t.nonNull.string("workspaceInvitationId");
  },
});

export const AcceptWorkspaceInvitationResult = objectType({
  name: "AcceptWorkspaceInvitationResult",
  definition(t) {
    t.field("workspace", { type: Workspace });
  },
});

export const createWorkspaceInvitationMutation = mutationField(
  "acceptWorkspaceInvitation",
  {
    type: AcceptWorkspaceInvitationResult,
    args: {
      input: arg({
        type: AcceptWorkspaceInvitationInput,
      }),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      if (!args.input) {
        throw new Error("Invalid input");
      }
      const workspace = await acceptWorkspaceInvitation({
        workspaceInvitationId: args.input.workspaceInvitationId,
        userId: context.user.id,
      });
      return { workspace };
    },
  }
);
