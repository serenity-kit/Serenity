import { AuthenticationError } from "apollo-server-express";
import { idArg, nonNull, queryField, stringArg } from "nexus";
import { getWorkspace } from "../../../database/workspace/getWorkspace";
import { getWorkspaces } from "../../../database/workspace/getWorkspaces";
import { Workspace } from "../../types/workspace";

export const workspaces = queryField((t) => {
  t.field("workspace", {
    type: Workspace,
    args: {
      id: idArg(),
      deviceSigningPublicKey: nonNull(stringArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      context.assertValidDeviceSigningPublicKeyForThisSession(
        args.deviceSigningPublicKey
      );
      const userId = context.user.id;
      if (args.id) {
        const workspace = await getWorkspace({
          userId,
          id: args.id,
          deviceSigningPublicKey: args.deviceSigningPublicKey,
        });
        if (!workspace) {
          return null;
        }
        return workspace;
      }

      const workspaces = await getWorkspaces({
        userId,
        cursor: undefined,
        skip: undefined,
        take: 1,
        deviceSigningPublicKey: args.deviceSigningPublicKey,
      });
      if (workspaces.length > 0) {
        return workspaces[0];
      }
      return null;
    },
  });
});
