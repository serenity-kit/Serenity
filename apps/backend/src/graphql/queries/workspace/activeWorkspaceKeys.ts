import { AuthenticationError } from "apollo-server-express";
import { idArg, nonNull, objectType, queryField, stringArg } from "nexus";
import { getActiveWorkspaceKeys } from "../../../database/workspace/getActiveWorkspaceKeys";
import { WorkspaceKey } from "../../types/workspace";

export const ActiveWorkspaceKeysResult = objectType({
  name: "ActiveWorkspaceKeysResult",
  definition(t) {
    t.nonNull.list.nonNull.field("activeWorkspaceKeys", { type: WorkspaceKey });
  },
});

export const activeWorkspaceKeysQuery = queryField((t) => {
  t.field("activeWorkspaceKeys", {
    type: ActiveWorkspaceKeysResult,
    args: {
      workspaceId: nonNull(idArg()),
      deviceSigningPublicKey: nonNull(stringArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const activeWorkspaceKeys = await getActiveWorkspaceKeys({
        userId: context.user.id,
        workspaceId: args.workspaceId,
        deviceSigningPublicKey: args.deviceSigningPublicKey,
      });
      return { activeWorkspaceKeys };
    },
  });
});
