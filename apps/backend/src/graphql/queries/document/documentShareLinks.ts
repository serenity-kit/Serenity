import { AuthenticationError, UserInputError } from "apollo-server-express";
import { idArg, nonNull, queryField } from "nexus";
import { getDocumentShareLinks } from "../../../database/document/getDocumentShareLinks";
import { DocumentShareLink } from "../../types/documentShareLink";

export const documentShareLinksQuery = queryField((t) => {
  // @ts-ignore sometimes the type is defined, sometimes not
  t.connectionField("documentShareLinks", {
    type: DocumentShareLink,
    disableBackwardPagination: true,
    cursorFromNode: (node) => node?.token ?? "",
    additionalArgs: {
      documentId: nonNull(idArg()),
    },
    async nodes(root, args, context) {
      if (args.first > 50) {
        throw new UserInputError(
          "Requested too many entries. First value exceeds 50."
        );
      }
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const userId = context.user.id;
      const cursor = args.after ? { token: args.after } : undefined;
      // prisma will include the cursor if skip: 1 is not set
      // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#do-i-always-have-to-skip-1
      const skip = cursor ? 1 : undefined;
      // include one extra project to set hasNextPage value
      const take: any = args.first ? args.first + 1 : undefined;

      return await getDocumentShareLinks({
        userId,
        documentId: args.documentId,
        cursor,
        skip,
        take,
      });
    },
  });
});
