import { AuthenticationError, UserInputError } from "apollo-server-express";
import { intArg, nonNull, objectType, queryField } from "nexus";
import { doesFolderSubkeyIdExist } from "../../../database/folder/doesFolderSubkeyIdExist";

export const FolderSubkeyIdExistsResult = objectType({
  name: "FolderSubkeyIdExistsResult",
  definition(t) {
    t.nonNull.boolean("folderSubkeyIdExists");
  },
});

export const folderSubkeyIdExists = queryField((t) => {
  t.field("folderSubkeyIdExists", {
    type: FolderSubkeyIdExistsResult,
    args: {
      subkeyId: nonNull(intArg()),
    },
    async resolve(_root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      if (!args.subkeyId) {
        throw new UserInputError("Invalid input: subKeyId cannot be null");
      }
      const folderSubkeyIdExists = await doesFolderSubkeyIdExist({
        subkeyId: args.subkeyId,
        userId: context.user.id,
      });
      return { folderSubkeyIdExists };
    },
  });
});
