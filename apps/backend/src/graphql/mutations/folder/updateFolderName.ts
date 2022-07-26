import { AuthenticationError, UserInputError } from "apollo-server-express";
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
    if (!args.input) {
      throw new UserInputError("Invalid input");
    }
    if (!args.input.id) {
      throw new UserInputError("Invalid input: id cannot be null");
    }
    if (!args.input.name) {
      throw new UserInputError("Invalid input: name cannot be null");
    }
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    const folder = await updateFolderName({
      id: args.input.id,
      name: args.input.name,
      userId: context.user.id,
    });
    return { folder };
  },
});
