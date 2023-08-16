import { AuthenticationError, UserInputError } from "apollo-server-express";
import { idArg, list, nonNull, objectType, queryField, stringArg } from "nexus";
import { getWorkspaceMembersByMainDeviceSigningPublicKey } from "../../../database/workspace/getWorkspaceMembersByMainDeviceSigningPublicKey";
import { WorkspaceMember } from "../../types/workspace";

export const WorkspaceMembersByMainDeviceSigningPublicKeyResult = objectType({
  name: "WorkspaceMembersByMainDeviceSigningPublicKeyResult",
  definition(t) {
    t.nonNull.list.nonNull.field("workspaceMembers", { type: WorkspaceMember });
  },
});

export const workspaceMembersByMainDeviceSigningPublicKeyQuery = queryField(
  (t) => {
    t.field("workspaceMembersByMainDeviceSigningPublicKey", {
      type: WorkspaceMembersByMainDeviceSigningPublicKeyResult,
      args: {
        workspaceId: nonNull(idArg({})),
        mainDeviceSigningPublicKeys: nonNull(
          list(nonNull(stringArg({ description: "max 50 are allowed" })))
        ),
      },
      async resolve(root, args, context) {
        if (!context.user) {
          throw new AuthenticationError("Not authenticated");
        }

        if (args.mainDeviceSigningPublicKeys.length > 50) {
          throw new UserInputError(
            "Maximum 50 mainDeviceSigningPublicKeys are allowed"
          );
        }

        const workspaceMembers =
          await getWorkspaceMembersByMainDeviceSigningPublicKey({
            workspaceId: args.workspaceId,
            userId: context.user.id,
            mainDeviceSigningPublicKeys: args.mainDeviceSigningPublicKeys,
          });
        return { workspaceMembers };
      },
    });
  }
);
