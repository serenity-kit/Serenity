import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { updateFolderName } from "../../../database/folder/updateFolderName";
import { Folder } from "../../types/folder";

export const UpdateFolderNameInput = inputObjectType({
  name: "UpdateFolderNameInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("encryptedName");
    t.nonNull.string("encryptedNameNonce");
    t.nonNull.int("subkeyId");
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
    input: nonNull(
      arg({
        type: UpdateFolderNameInput,
      })
    ),
  },
  async resolve(_root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    const folder = await updateFolderName({
      id: args.input.id,
      encryptedName: args.input.encryptedName,
      encryptedNameNonce: args.input.encryptedNameNonce,
      subkeyId: args.input.subkeyId,
      userId: context.user.id,
    });
    return { folder };
  },
});
