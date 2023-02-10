import { AuthenticationError, UserInputError } from "apollo-server-express";
import { nonNull, objectType, queryField, stringArg } from "nexus";
import { prisma } from "../../database/prisma";

export const UserIdFromUsernameResult = objectType({
  name: "UserIdFromUsernameResult",
  definition(t) {
    t.nonNull.string("id");
  },
});

export const userIdFromUsernameQuery = queryField((t) => {
  t.field("userIdFromUsername", {
    type: UserIdFromUsernameResult,
    args: {
      username: nonNull(stringArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const user = await prisma.user.findFirst({
        where: {
          username: args.username,
        },
      });
      if (!user) {
        throw new UserInputError("User not found");
      }
      return { id: user.id };
    },
  });
});
