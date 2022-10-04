import { AuthenticationError, UserInputError } from "apollo-server-express";
import { nonNull, queryField, stringArg } from "nexus";
import { getWorkspaces } from "../../../database/workspace/getWorkspaces";
import { Workspace } from "../../types/workspace";

export const workspaces = queryField((t) => {
  // @ts-ignore sometimes the type is defined, sometimes not
  t.connectionField("workspaces", {
    type: Workspace,
    disableBackwardPagination: true,
    cursorFromNode: (node) => node?.id ?? "",
    additionalArgs: {
      deviceSigningPublicKey: nonNull(stringArg()),
    },
    async nodes(root, args, context) {
      console.log("======== workspaces graphql query =======");
      console.log("muhahahaha");
      console.log({ context, args });
      if (args.first > 50) {
        throw new UserInputError(
          "Requested too many workspaces. First value exceeds 50."
        );
      }
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      console.log("verifying device signing public key");
      context.assertValidDeviceSigningPublicKeyForThisSession(
        args.deviceSigningPublicKey
      );
      console.log("signing public key ok");
      const userId = context.user.id;
      const cursor = args.after ? { id: args.after } : undefined;
      // prisma will include the cursor if skip: 1 is not set
      // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#do-i-always-have-to-skip-1
      const skip = cursor ? 1 : undefined;
      // include one extra project to set hasNextPage value
      const take: any = args.first ? args.first + 1 : undefined;
      const deviceSigningPublicKey = args.deviceSigningPublicKey;
      console.log({ userId, cursor, skip, take, deviceSigningPublicKey });
      const workspaces = await getWorkspaces({
        userId,
        cursor,
        skip,
        take,
        deviceSigningPublicKey,
      });
      console.log({ workspaces });
      if (workspaces.length > 0) {
        console.log({ members: workspaces[0].members });
        console.log({ workspaceKeys: workspaces[0].workspaceKeys });
        console.log({ currentWorkspaceKey: workspaces[0].currentWorkspaceKey });
      }
      return workspaces;
    },
  });
});
