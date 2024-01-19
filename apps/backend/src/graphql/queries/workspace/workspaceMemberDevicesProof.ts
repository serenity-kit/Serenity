import { AuthenticationError } from "apollo-server-express";
import { idArg, nonNull, queryField, stringArg } from "nexus";
import { prisma } from "../../../database/prisma";
import { getWorkspaceMemberDevicesProof } from "../../../database/workspace/getWorkspaceMemberDevicesProof";
import { WorkspaceMemberDevicesProof } from "../../types/workspaceMemberDevicesProof";

export const workspaceMemberDevicesProofQuery = queryField((t) => {
  t.field("workspaceMemberDevicesProof", {
    type: WorkspaceMemberDevicesProof,
    args: {
      workspaceId: nonNull(idArg()),
      hash: stringArg(),
      invitationId: idArg(),
      documentShareLinkToken: stringArg(),
    },
    async resolve(root, args, context) {
      if (!context.user && typeof args.documentShareLinkToken !== "string") {
        throw new AuthenticationError("Not authenticated");
      }

      return await getWorkspaceMemberDevicesProof({
        workspaceId: args.workspaceId,
        invitationId: args.invitationId || undefined,
        documentShareLinkToken: args.documentShareLinkToken || undefined,
        hash: args.hash || undefined,
        userId: context.user?.id,
        prisma,
      });
    },
  });
});
