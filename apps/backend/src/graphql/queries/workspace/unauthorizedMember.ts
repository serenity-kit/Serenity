import { AuthenticationError } from "apollo-server-express";
import { objectType, queryField } from "nexus";
import { unauthorizedMember } from "../../../database/workspace/unauthorizedMember";
import { Device } from "../../types/device";

export const UnauthorizedMemberResult = objectType({
  name: "UnauthorizedMemberResult",
  definition(t) {
    t.nonNull.string("userId");
    t.nonNull.string("userMainDeviceSigningPublicKey");
    t.nonNull.string("workspaceId");
    t.nonNull.list.nonNull.field("devices", { type: Device });
  },
});

export const unauthorizedMemberQuery = queryField((t) => {
  t.field("unauthorizedMember", {
    type: UnauthorizedMemberResult,
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }

      return await unauthorizedMember({
        userId: context.user.id,
      });
    },
  });
});
