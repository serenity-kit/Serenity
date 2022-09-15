// unauthorizedMembers(workspaceIds: ['abc', 'cde'])

import { AuthenticationError } from "apollo-server-express";
import { idArg, nonNull, objectType, queryField } from "nexus";
import { prisma } from "../../../database/prisma";

export const IsWorkspaceAuthorizedResult = objectType({
  name: "IsWorkspaceAuthorizedResult",
  definition(t) {
    t.nonNull.boolean("isAuthorized");
  },
});

export const isWorkspaceAuthorizedQuery = queryField((t) => {
  t.field("isWorkspaceAuthorized", {
    type: IsWorkspaceAuthorizedResult,
    args: {
      workspaceId: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          userId: context.user.id,
          workspaceId: args.workspaceId,
        },
        select: { isAuthorizedMember: true },
      });
      if (!userToWorkspace) {
        throw new Error("Workspace not found.");
      }
      return { isAuthorized: userToWorkspace.isAuthorizedMember };
    },
  });
});
