import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
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
      input: nonNull(
        arg({
          type: DeleteWorkspaceInvitationsInput,
        })
      ),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      await deleteWorkspaceInvitations({
        workspaceInvitationIds: args.input.ids,
        userId: context.user.id,
      });
      return { status: "success" };
    },
  }
);
