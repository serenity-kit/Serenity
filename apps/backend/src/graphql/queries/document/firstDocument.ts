import { AuthenticationError } from "apollo-server-express";
import { idArg, nonNull, queryField } from "nexus";
import { getFirstDocument } from "../../../database/document/getFirstDocument";
import { formatDocument } from "../../../types/document";
import { Document } from "../../types/document";

export const firstDocumentQuery = queryField((t) => {
  t.field("firstDocument", {
    type: Document,
    args: {
      workspaceId: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const userId = context.user.id;
      const document = await getFirstDocument({
        userId,
        workspaceId: args.workspaceId,
      });
      return formatDocument(document);
    },
  });
});
