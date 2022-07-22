import { AuthenticationError } from "apollo-server-express";
import { idArg, list, nonNull, queryField } from "nexus";
import { getDocumentPath } from "../../../database/document/getDocumentPath";
import { Folder } from "../../types/folder";

export const documentPath = queryField((t) => {
  t.field("documentPath", {
    type: list(Folder),
    args: {
      id: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const userId = context.user.id;
      const folderList = await getDocumentPath({
        userId,
        id: args.id,
      });
      return folderList;
    },
  });
});
