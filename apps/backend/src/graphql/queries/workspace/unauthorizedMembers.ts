// unauthorizedMembers(workspaceIds: ['abc', 'cde'])

import { AuthenticationError } from "apollo-server-express";
import { idArg, list, nonNull, objectType, queryField } from "nexus";
import { prisma } from "../../../database/prisma";

export const UnauthorizedMembersResult = objectType({
  name: "UnauthorizedMembersResult",
  definition(t) {
    t.nonNull.list.string("userIds");
  },
});

export const unauthorizedMembers = queryField((t) => {
  t.field("unauthorizedMembers", {
    type: UnauthorizedMembersResult,
    args: {
      workspaceIds: nonNull(list(nonNull(idArg()))),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const validWorspaceIds: string[] = [];
      const validWorkspaces = await prisma.usersToWorkspaces.findMany({
        where: {
          userId: context.user.id,
          workspaceId: { in: args.workspaceIds },
        },
        select: { workspaceId: true },
      });
      validWorkspaces.forEach((userToWorkspace) => {
        validWorspaceIds.push(userToWorkspace.workspaceId);
      });
      // get user's valid workspaceIds
      const notYetAuthorizedMembers = await prisma.usersToWorkspaces.findMany({
        where: {
          workspaceId: { in: validWorspaceIds },
          isAuthorizedMember: false,
        },
        select: { userId: true },
      });
      const userIds: string[] = [];
      notYetAuthorizedMembers.forEach((notYetAuthorizedMember) => {
        userIds.push(notYetAuthorizedMember.userId);
      });
      return { userIds };
    },
  });
});
