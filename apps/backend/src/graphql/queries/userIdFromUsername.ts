import { AuthenticationError } from "apollo-server-express";
import { queryField, objectType, nonNull, stringArg } from "nexus";
import { prisma } from "../../database/prisma";

export const UserIdFromUsernameResult = objectType({
  name: "UserIdFromUsernameResult",
  definition(t) {
    t.nonNull.string("id");
  },
});

export const userIdFromUsername = queryField((t) => {
  t.field("userIdFromUsername", {
    type: UserIdFromUsernameResult,
    args: {
      username: nonNull(stringArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      if (!args.username) {
        throw new Error("Invalid input");
      }
      const user = await prisma.user.findFirst({
        where: {
          username: args.username,
        },
      });
      if (!user) {
        throw Error("User not found");
      }
      return { id: user.id };
    },
  });
});
