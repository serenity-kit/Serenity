import { AuthenticationError, UserInputError } from "apollo-server-express";
import { queryField } from "nexus";
import { getUserChain } from "../../../database/userChain/getUserChain";
import { UserChainEvent } from "../../types/userChain";

export const userChainQuery = queryField((t) => {
  // @ts-ignore sometimes the type is defined, sometimes not
  t.connectionField("userChain", {
    type: UserChainEvent,
    disableBackwardPagination: true,
    cursorFromNode: (node) => (node ? `${node.position}` : ""),
    async nodes(root, args, context) {
      if (args.first > 5000) {
        throw new UserInputError(
          "Requested too many user chain events. First value exceeds 5000."
        );
      }
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const cursor = args.after ? { id: args.after } : undefined;
      // prisma will include the cursor if skip: 1 is not set
      // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#do-i-always-have-to-skip-1
      const skip = cursor ? 1 : undefined;
      // include one extra project to set hasNextPage value
      const take: any = args.first ? args.first + 1 : undefined;

      const userId = context.user.id;
      const userChain = await getUserChain({
        userId,
        cursor,
        skip,
        take,
      });
      return userChain;
    },
  });
});
