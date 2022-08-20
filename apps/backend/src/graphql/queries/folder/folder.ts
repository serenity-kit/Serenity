import { AuthenticationError, UserInputError } from "apollo-server-express";
import { idArg, nonNull, queryField } from "nexus";
import { getFolder } from "../../../database/folder/getFolder";
import { Folder } from "../../types/folder";

export const folderQuery = queryField((t) => {
  t.field("folder", {
    type: Folder,
    args: {
      id: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      if (!args.id) {
        throw new UserInputError("Invalid input: id cannot be null");
      }
      const userId = context.user.id;
      const folder = await getFolder({
        userId,
        id: args.id,
      });
      return folder;
    },
  });
});
