import * as userChain from "@serenity-kit/user-chain";
import { AuthenticationError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { logout } from "../../../database/authentication/logout";

export const LogoutInput = inputObjectType({
  name: "LogoutInput",
  definition(t) {
    t.nonNull.string("serializedUserChainEvent");
  },
});

export const LogoutResult = objectType({
  name: "LogoutResult",
  definition(t) {
    t.nonNull.boolean("success");
  },
});

export const logoutMutation = mutationField("logout", {
  type: LogoutResult,
  args: {
    input: arg({
      type: LogoutInput,
    }),
  },
  async resolve(_root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }

    const removeDeviceEvent = args.input
      ? userChain.RemoveDeviceEvent.parse(
          JSON.parse(args.input.serializedUserChainEvent)
        )
      : null;

    await logout({
      userId: context.user.id,
      sessionKey: context.session.sessionKey,
      removeDeviceEvent,
    });

    return { success: true };
  },
});
