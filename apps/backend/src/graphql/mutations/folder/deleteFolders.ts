import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { deleteFolders } from "../../../database/folder/deleteFolders";

export const DeleteFoldersInput = inputObjectType({
  name: "DeleteFoldersInput",
  definition(t) {
    t.nonNull.list.nonNull.field("ids", {
      type: "String",
    });
    t.nonNull.string("workspaceId");
  },
});

export const DeleteFoldersResult = objectType({
  name: "DeleteFoldersResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const deleteFoldersMutation = mutationField("deleteFolders", {
  type: DeleteFoldersResult,
  args: {
    input: nonNull(
      arg({
        type: DeleteFoldersInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    await deleteFolders({
      folderIds: args.input.ids,
      workspaceId: args.input.workspaceId,
      userId: context.user.id,
    });
    return { status: "success" };
  },
});
