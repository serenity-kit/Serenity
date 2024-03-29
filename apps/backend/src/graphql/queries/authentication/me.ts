import { UserInputError } from "apollo-server-express";
import { booleanArg, idArg, objectType, queryField } from "nexus";
import { getWorkspaceLoadingInfo } from "../../../database/workspace/getWorkspaceLoadingInfo";
import { WorkspaceLoadingInfo } from "../../types/workspace";

export const MeResult = objectType({
  name: "MeResult",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("username");
    t.nonNull.string("mainDeviceSigningPublicKey");
    t.field("workspaceLoadingInfo", {
      type: WorkspaceLoadingInfo,
      args: {
        workspaceId: idArg(),
        documentId: idArg(),
        returnOtherWorkspaceIfNotFound: booleanArg({ default: false }),
        returnOtherDocumentIfNotFound: booleanArg({ default: false }),
      },
      async resolve(root, args, context) {
        if (!args.workspaceId && args.documentId) {
          throw new UserInputError(
            "Invalid input: documentId can't be set without workspaceId"
          );
        }
        const userId = context.user.id;
        const workspace = await getWorkspaceLoadingInfo({
          userId,
          workspaceId: args.workspaceId || undefined,
          documentId: args.documentId || undefined,
          returnOtherWorkspaceIfNotFound:
            args.returnOtherWorkspaceIfNotFound || false,
          returnOtherDocumentIfNotFound:
            args.returnOtherDocumentIfNotFound || false,
        });
        if (!workspace) {
          return null;
        }
        return {
          id: workspace.id,
          isAuthorized: workspace.usersToWorkspaces[0].isAuthorizedMember,
          documentId: workspace.documents[0]?.id || null,
        };
      },
    });
  },
});

// return string type
export const meQuery = queryField((t) => {
  t.field("me", {
    type: MeResult,
    args: null,
    async resolve(root, args, context) {
      if (!context.user) {
        return null;
      }
      const id = context.user.id;
      const username = context.user.username;
      const mainDeviceSigningPublicKey =
        context.user.mainDeviceSigningPublicKey;
      return { id, username, mainDeviceSigningPublicKey };
    },
  });
});
