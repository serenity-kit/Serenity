import { AuthenticationError } from "apollo-server-express";
import { idArg, nonNull, queryField, stringArg } from "nexus";
import { getFileUrl } from "../../../database/file/getFileUrl";
import { File } from "../../types/file";

export const fileUrlQuery = queryField((t) => {
  t.field("fileUrl", {
    type: File,
    args: {
      fileId: nonNull(idArg()),
      documentId: nonNull(idArg()),
      documentShareLinkToken: stringArg(),
    },
    async resolve(root, args, context) {
      if (!context.user && typeof args.documentShareLinkToken !== "string") {
        throw new AuthenticationError("Not authenticated");
      }
      const downloadUrl = await getFileUrl({
        userId: context.user?.id,
        fileId: args.fileId,
        documentId: args.documentId,
        documentShareLinkToken: args.documentShareLinkToken,
      });
      return {
        id: args.fileId,
        downloadUrl,
      };
    },
  });
});
