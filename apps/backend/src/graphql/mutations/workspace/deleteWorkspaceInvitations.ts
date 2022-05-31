import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { deleteWorkspaceInvitations } from "../../../database/workspace/deleteWorkspaceInvitations";

export const DeleteWorkspaceInvitationsInput = inputObjectType({
  name: "DeleteWorkspaceInvitationsInput",
  definition(t) {
    t.nonNull.list.nonNull.field("ids", {
      type: "String",
    });
  },
});

export const DeleteWorkspaceInvitationsResult = objectType({
  name: "DeleteWorkspaceInvitationsResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const deleteWorkspaceInvitationsMutation = mutationField(
  "deleteWorkspaceInvitations",
  {
    type: DeleteWorkspaceInvitationsResult,
    args: {
      input: arg({
        type: DeleteWorkspaceInvitationsInput,
      }),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      if (!args.input) {
        throw new Error("Invalid input");
      }
      await deleteWorkspaceInvitations({
        workspaceInvitationIds: args.input.ids,
        userId: context.user.id,
      });
      return { status: "success" };
    },
  }
);
