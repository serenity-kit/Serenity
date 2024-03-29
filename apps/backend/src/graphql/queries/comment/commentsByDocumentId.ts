import { AuthenticationError, UserInputError } from "apollo-server-express";
import { idArg, nonNull, queryField, stringArg } from "nexus";
import { getCommentsByDocumentId } from "../../../database/comment/getCommentsByDocumentId";
import { Comment } from "../../types/comment";

export const commentsByDocumentIdQuery = queryField((t) => {
  // @ts-ignore sometimes the type is defined, sometimes not
  t.connectionField("commentsByDocumentId", {
    type: Comment,
    cursorFromNode: (node) => node?.id ?? "",
    additionalArgs: {
      documentId: nonNull(idArg()),
      documentShareLinkToken: stringArg(),
    },
    async nodes(root, args, context) {
      if (args.first && args.first > 200) {
        throw new UserInputError(
          "Requested too many comments. First value exceeds 200."
        );
      }
      if (!context.user && typeof args.documentShareLinkToken !== "string") {
        throw new AuthenticationError("Not authenticated");
      }
      const cursor = args.after ? { id: args.after } : undefined;
      // prisma will include the cursor if skip: 1 is not set
      // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#do-i-always-have-to-skip-1
      const skip = cursor ? 1 : undefined;
      // include one extra project to set hasNextPage value
      const take: any = args.first ? args.first + 1 : undefined;
      const comments = await getCommentsByDocumentId({
        userId: context.user?.id,
        documentId: args.documentId,
        documentShareLinkToken: args.documentShareLinkToken,
        cursor,
        skip,
        take,
      });
      return comments;
    },
  });
});
