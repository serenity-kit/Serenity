import { AuthenticationError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { deleteWorkspaces } from "../../../database/workspace/deleteWorkspaces";

export const DeleteWorkspacesInput = inputObjectType({
  name: "DeleteWorkspacesInput",
  definition(t) {
    t.nonNull.list.nonNull.field("ids", {
      type: "String",
    });
  },
});

export const DeleteWorkspacesResult = objectType({
  name: "DeleteWorkspacesResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const deleteWorkspacesMutation = mutationField("deleteWorkspaces", {
  type: DeleteWorkspacesResult,
  args: {
    input: arg({
      type: DeleteWorkspacesInput,
    }),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    if (!args.input) {
      throw new Error("Invalid input");
    }
    await deleteWorkspaces({
      workspaceIds: args.input.ids,
      userId: context.user.id,
    });
    return { status: "success" };
  },
});
