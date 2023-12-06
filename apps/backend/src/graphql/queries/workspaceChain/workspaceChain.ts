import { AuthenticationError, UserInputError } from "apollo-server-express";
import { idArg, nonNull, queryField } from "nexus";
import { getLoginAttemptAndUserBySessionToken } from "../../../database/authentication/getLoginAttemptAndUserBySessionToken";
import {
  isValidSessionAuthorization,
  splitSessionAuthorization,
} from "../../../database/authentication/getSessionIncludingUserBySessionAuthorization";
import { getWorkspaceChain } from "../../../database/workspaceChain/getWorkspaceChain";
import { WorkspaceChainEvent } from "../../types/workspaceChain";

export const workspaceChainQuery = queryField((t) => {
  // @ts-ignore sometimes the type is defined, sometimes not
  t.connectionField("workspaceChain", {
    type: WorkspaceChainEvent,
    disableBackwardPagination: true,
    cursorFromNode: (node) => (node ? `${node.position}` : ""),
    additionalArgs: {
      workspaceId: nonNull(idArg()),
    },
    async nodes(root, args, context) {
      if (args.first > 5000) {
        throw new UserInputError(
          "Requested too many workspace chain events. First value exceeds 5000."
        );
      }

      let userId = "";
      if (context.user) {
        userId = context.user.id;
      } else if (context.authorizationHeader) {
        const { sessionToken } = splitSessionAuthorization({
          authorization: context.authorizationHeader,
        });

        try {
          const { user, loginAttempt } =
            await getLoginAttemptAndUserBySessionToken({
              sessionToken,
            });
          if (
            !loginAttempt.sessionKey ||
            !isValidSessionAuthorization({
              authorization: context.authorizationHeader,
              sessionKey: loginAttempt.sessionKey,
            })
          ) {
            throw new AuthenticationError("Not authenticated");
          }
          userId = user.id;
        } catch (e) {
          throw new AuthenticationError("Not authenticated");
        }
      } else {
        throw new AuthenticationError("Not authenticated");
      }
      const afterPosition = args.after ? parseInt(args.after, 10) : undefined;
      // prisma will include the cursor if skip: 1 is not set
      // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#do-i-always-have-to-skip-1
      const skip = typeof afterPosition === "number" ? 1 : undefined;
      // include one extra project to set hasNextPage value
      const take: any = args.first ? args.first + 1 : undefined;

      const workspaceChain = await getWorkspaceChain({
        userId,
        workspaceId: args.workspaceId,
        afterPosition,
        skip,
        take,
      });
      return workspaceChain;
    },
  });
});
