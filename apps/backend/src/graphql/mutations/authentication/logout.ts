import { AuthenticationError } from "apollo-server-express";
import { mutationField, objectType } from "nexus";
import { logout } from "../../../database/authentication/logout";

export const LogoutResult = objectType({
  name: "LogoutResult",
  definition(t) {
    t.nonNull.boolean("success");
  },
});

export const logoutMutation = mutationField("logout", {
  type: LogoutResult,
  async resolve(_root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    await logout({
      userId: context.user.id,
      sessionKey: context.session.sessionKey,
    });

    return { success: true };
  },
});
