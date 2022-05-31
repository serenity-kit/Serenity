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
        throw new Error("Unauthorized");
      }
      if (!args.input) {
        throw new Error("Invalid input");
      }
      const workspaceInvitation = await createWorkspaceInvitation({
        workspaceId: args.input.workspaceId,
        inviterUserId: context.user.id,
      });
      return { workspaceInvitation };
    },
  }
);
