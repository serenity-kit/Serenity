import { AuthenticationError } from "apollo-server-express";
import { idArg, nonNull, queryField } from "nexus";
import { getWorkspaceMemberDevicesProof } from "../../../database/workspace/getWorkspaceMemberDevicesProof";
import { WorkspaceMemberDevicesProof } from "../../types/workspaceMemberDevicesProof";

export const workspaceMemberDevicesProofQuery = queryField((t) => {
  t.field("workspaceMemberDevicesProof", {
    type: WorkspaceMemberDevicesProof,
    args: {
      workspaceId: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }

      return await getWorkspaceMemberDevicesProof({
        workspaceId: args.workspaceId,
        userId: context.user.id,
      });
    },
  });
});
