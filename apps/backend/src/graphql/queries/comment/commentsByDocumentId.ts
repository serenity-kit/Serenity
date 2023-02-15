import { AuthenticationError, UserInputError } from "apollo-server-express";
import { idArg, nonNull, queryField, stringArg } from "nexus";
import { getCommentsByDocumentId } from "../../../database/comment/getCommentsByDocumentId";
import { formatComment } from "../../../types/comment";
import { Comment } from "../../types/comment";

export const commentsByDocumentIdQuery = queryField((t) => {
  // @ts-ignore sometimes the type is defined, sometimes not
  t.connectionField("commentsByDocumentId", {
    type: Comment,
    cursorFromNode: (node) => node?.id ?? "",
    additionalArgs: {
      documentId: nonNull(idArg()),
      documentShareLinkToken: stringArg(),
      deviceSigningPublicKey: stringArg(),
    },
    async nodes(root, args, context) {
      if (args.first && args.first > 50) {
        throw new UserInputError(
          "Requested too many devices. First value exceeds 50."
        );
      }
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const userId = context.user.id;
      const cursor = args.after ? { id: args.after } : undefined;
      // prisma will include the cursor if skip: 1 is not set
      // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#do-i-always-have-to-skip-1
      const skip = cursor ? 1 : undefined;
      // include one extra project to set hasNextPage value
      const take: any = args.first ? args.first + 1 : undefined;
      const comments = await getCommentsByDocumentId({
        userId,
        documentId: args.documentId,
        documentShareLinkToken: args.documentShareLinkToken,
        deviceSigningPublicKey: args.deviceSigningPublicKey,
        cursor,
        skip,
        take,
      });
      const formattedComments = comments.map((comment) =>
        formatComment(comment)
      );
      return formattedComments;
    },
  });
});
