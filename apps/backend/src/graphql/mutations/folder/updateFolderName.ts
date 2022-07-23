import { AuthenticationError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { updateFolderName } from "../../../database/folder/updateFolderName";
import { Folder } from "../../types/folder";

export const UpdateFolderNameInput = inputObjectType({
  name: "UpdateFolderNameInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
  },
});

export const UpdateFolderNameResult = objectType({
  name: "UpdateFolderNameResult",
  definition(t) {
    t.field("folder", { type: Folder });
  },
});

export const updateFolderNameMutation = mutationField("updateFolderName", {
  type: UpdateFolderNameResult,
  args: {
    input: arg({
      type: UpdateFolderNameInput,
    }),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    if (!args.input) {
      throw new Error("Invalid input");
    }
    const folder = await updateFolderName({
      id: args.input.id,
      name: args.input.name,
      userId: context.user.id,
    });
    return { folder };
  },
});
