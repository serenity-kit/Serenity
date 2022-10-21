import { AuthenticationError, UserInputError } from "apollo-server-express";
import { idArg, nonNull, queryField } from "nexus";
import { getDocument } from "../../../database/document/getDocument";
import { formatDocument } from "../../../types/document";
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
      if (!args.id) {
        throw new UserInputError("Invalid input: id cannot be null");
      }
      const userId = context.user.id;
      const document = await getDocument({
        userId,
        id: args.id,
      });
      const formattedDocument = formatDocument(document);
      console.log({ formattedDocument });
      return formattedDocument;
    },
  });
});
