import { AuthenticationError } from "apollo-server-express";
import { idArg, nonNull, objectType, queryField, stringArg } from "nexus";
import { getWorkspaceKeyByDocumentId } from "../../../database/document/getWorkspaceKeyByDocumentId";
import { formatWorkspaceKey } from "../../../types/workspace";
import { WorkspaceKey } from "../../types/workspace";

export const WorkspaceKeyByDocumentIdResult = objectType({
  name: "WorkspaceKeyByDocumentIdResult",
  definition(t) {
    t.nonNull.field("nameWorkspaceKey", { type: WorkspaceKey });
  },
});

export const workspaceKeyByDocumentIdQuery = queryField((t) => {
  t.field("workspaceKeyByDocumentId", {
    type: WorkspaceKeyByDocumentIdResult,
    args: {
      documentId: nonNull(idArg()),
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
      const workspaceKey = await getWorkspaceKeyByDocumentId({
        userId,
        documentId: args.documentId,
        deviceSigningPublicKey: args.deviceSigningPublicKey,
      });
      return { nameWorkspaceKey: formatWorkspaceKey(workspaceKey) };
    },
  });
});
