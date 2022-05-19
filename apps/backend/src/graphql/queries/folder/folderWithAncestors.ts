import { idArg, queryField } from "nexus";
import { prisma } from "../../../database/prisma";
import { getFolder } from "../../../database/folder/getFolder";
// import { getFolders } from "../../../database/folder/getFolders";
import { Folder } from "../../types/folder";

export const folders = queryField((t) => {
  t.field("folder", {
    type: Folder,
    args: {
      id: idArg(),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      const username = context.user.username;
      const rawFolder = await getFolder({
        username,
        id: args.id,
      });
      if (!rawFolder) {
        return null;
      }
      const folder = {
        id: rawFolder.id,
        name: rawFolder.name,
        idSignature: rawFolder.idSignature,
        workspaceId: rawFolder.workspaceId,
        parentFolderId: rawFolder.parentFolderId,
        rootFolderId: rawFolder.rootFolderId,
        parentFolders: rawFolder.parentFolders,
      };
      return folder;
    },
  });
});
