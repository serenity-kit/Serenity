import { AuthenticationError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { deleteFolders } from "../../../database/folder/deleteFolders";

export const DeleteFoldersInput = inputObjectType({
  name: "DeleteFoldersInput",
  definition(t) {
    t.nonNull.list.nonNull.field("ids", {
      type: "String",
    });
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
    input: arg({
      type: DeleteFoldersInput,
    }),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    if (!args.input) {
      throw new Error("Invalid input");
    }
    console.log({ ids: args.input.ids });
    await deleteFolders({
      folderIds: args.input.ids,
      userId: context.user.id,
    });
    return { status: "success" };
  },
});
