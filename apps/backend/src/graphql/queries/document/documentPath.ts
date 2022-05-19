import { idArg, list, queryField } from "nexus";
import { getDocumentPath } from "../../../database/document/getDocumentPath";
import { Folder } from "../../types/folder";

export const folders = queryField((t) => {
  t.field("documentPath", {
    type: list(Folder),
    args: {
      id: idArg(),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      const username = context.user.username;
      const folderList = await getDocumentPath({
        username,
        id: args.id,
      });
      return folderList;
    },
  });
});
