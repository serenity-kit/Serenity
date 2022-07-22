import { AuthenticationError } from "apollo-server-express";
import { idArg, nonNull, queryField } from "nexus";
import { getDocument } from "../../../database/document/getDocument";
import { Document } from "../../types/document";

export const documentQuery = queryField((t) => {
  t.field("document", {
    type: Document,
    args: {
      id: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const userId = context.user.id;
      const document = await getDocument({
        userId,
        id: args.id,
      });
      return document;
    },
  });
});
