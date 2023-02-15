import { AuthenticationError, UserInputError } from "apollo-server-express";
import { idArg, list, nonNull, queryField } from "nexus";
import { getFolderTrace } from "../../../database/folder/getFolderTrace";
import { formatFolder } from "../../../types/folder";
import { Folder } from "../../types/folder";

export const folderTraceQuery = queryField((t) => {
  t.field("folderTrace", {
    type: nonNull(list(nonNull(Folder))),
    args: {
      folderId: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      if (args.folderId === "") {
        throw new UserInputError(
          "Invalid input: folderId cannot be an empty string"
        );
      }
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const userId = context.user.id;
      const folderTrace = await getFolderTrace({
        userId,
        folderId: args.folderId,
      });
      const formattedFolderTrace = folderTrace.map((folder) =>
        formatFolder(folder)
      );
      return formattedFolderTrace;
    },
  });
});
