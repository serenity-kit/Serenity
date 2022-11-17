import { AuthenticationError } from "apollo-server-express";
import { idArg, nonNull, queryField } from "nexus";
import { getDocumentShareLink } from "../../../database/document/getDocumentShareLink";
import { DocumentShareLink } from "../../types/documentShareLink";

export const documentShareLinkQuery = queryField((t) => {
  t.field("documentShareLink", {
    type: DocumentShareLink,
    args: {
      token: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const documentShareLink = await getDocumentShareLink({
        userId: context.user.id,
        token: args.token,
      });
      return documentShareLink;
    },
  });
});
