import { AuthenticationError } from "apollo-server-express";
import { idArg, nonNull, queryField } from "nexus";
import { getFileUrl } from "../../../database/file/getFileUrl";
import { File } from "../../types/file";

export const fileUrlQuery = queryField((t) => {
  t.field("fileUrl", {
    type: File,
    args: {
      fileId: nonNull(idArg()),
      documentId: nonNull(idArg()),
      workspaceId: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const downloadUrl = await getFileUrl({
        userId: context.user.id,
        fileId: args.fileId,
        documentId: args.documentId,
        workspaceId: args.workspaceId,
      });
      return {
        id: args.fileId,
        downloadUrl,
      };
    },
  });
});
