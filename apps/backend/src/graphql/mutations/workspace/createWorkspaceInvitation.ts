import { AuthenticationError, UserInputError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createWorkspaceInvitation } from "../../../database/workspace/createWorkspaceInvitation";
import { WorkspaceInvitation } from "../../types/workspace";

export const CreateWorkspaceInvitationInput = inputObjectType({
  name: "CreateWorkspaceInvitationInput",
  definition(t) {
    t.nonNull.string("workspaceId");
  },
});

export const CreateWorkspaceInvitationResult = objectType({
  name: "CreateWorkspaceInvitationResult",
  definition(t) {
    t.field("workspaceInvitation", { type: WorkspaceInvitation });
  },
});

export const createWorkspaceInvitationMutation = mutationField(
  "createWorkspaceInvitation",
  {
    type: CreateWorkspaceInvitationResult,
    args: {
      input: arg({
        type: CreateWorkspaceInvitationInput,
      }),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      if (!args.input) {
        throw new UserInputError("Invalid input");
      }
      if (!args.input.workspaceId) {
        throw new UserInputError("Invalid input: workspaceId cannot be null");
      }
      const workspaceInvitation = await createWorkspaceInvitation({
        workspaceId: args.input.workspaceId,
        inviterUserId: context.user.id,
      });
      return { workspaceInvitation };
    },
  }
);
