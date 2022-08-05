import { AuthenticationError, UserInputError } from "apollo-server-express";
import { nonNull, queryField, stringArg } from "nexus";
import { getWorskpaceKeysForWorkspace } from "../../../database/workspace/getWorkspaceKeysForWorkspace";
import { WorkspaceKey } from "../../types/workspace";

export const folders = queryField((t) => {
  // @ts-ignore sometimes the type is defined, sometimes not
  t.connectionField("workspaceKeys", {
    type: WorkspaceKey,
    disableBackwardPagination: true,
    cursorFromNode: (node) => node?.id ?? "",
    additionalArgs: {
      workspaceId: nonNull(stringArg()),
      deviceSigningPublicKey: nonNull(stringArg()),
    },
    async nodes(root, args, context) {
      if (args.first > 500) {
        throw new UserInputError(
          "Requested too many workspaceKeys. First value exceeds 500."
        );
      }
      if (!args.workspaceId) {
        throw new UserInputError("Invalid input: workspaceId cannot be null");
      }
      if (!args.deviceSigningPublicKey) {
        throw new UserInputError(
          "Invalid input: deviceSigningPublicKey cannot be null"
        );
      }
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const userId = context.user.id;
      const cursor = args.after ? { id: args.after } : undefined;
      // prisma will include the cursor if skip: 1 is not set
      // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#do-i-always-have-to-skip-1
      const skip = cursor ? 1 : undefined;
      // include one extra project to set hasNextPage value
      const take: any = args.first ? args.first + 1 : undefined;
      const folders = await getWorskpaceKeysForWorkspace({
        userId,
        workspaceId: args.workspaceId,
        deviceSigningPublicKey: args.deviceSigningPublicKey,
        cursor,
        skip,
        take,
      });
      return folders;
    },
  });
});
