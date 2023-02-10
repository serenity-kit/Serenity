import { AuthenticationError } from "apollo-server-express";
import { idArg, nonNull, objectType, queryField } from "nexus";
import { getWorkspaceKeyByDocumentId } from "../../../database/document/getWorkspaceKeyByDocumentId";
import { formatWorkspaceKey } from "../../../types/workspace";
import { WorkspaceKey } from "../../types/workspace";

export const NameWorkspaceKey = objectType({
  name: "NameWorkspaceKey",
  definition(t) {
    t.nonNull.field("nameWorkspaceKey", { type: WorkspaceKey });
  },
});

export const workspaces = queryField((t) => {
  t.field("workspaceKeyByDocumentId", {
    type: NameWorkspaceKey,
    args: {
      documentId: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const userId = context.user.id;
      const workspaceKey = await getWorkspaceKeyByDocumentId({
        userId,
        documentId: args.documentId,
        deviceSigningPublicKey: context.session.deviceSigningPublicKey,
      });
      return { nameWorkspaceKey: formatWorkspaceKey(workspaceKey) };
    },
  });
});