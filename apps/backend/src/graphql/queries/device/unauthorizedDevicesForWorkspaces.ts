import { AuthenticationError } from "apollo-server-express";
import { objectType, queryField } from "nexus";
import { getDevicesOfUnauthorizedUsers } from "../../../database/device/getDevicesOfUnauthorizedUsers";
import { WorkspaceIdWithMemberDevices } from "../../types/workspace";

export const UnauthorizedDevicesForWorkspacesResult = objectType({
  name: "UnauthorizedDevicesForWorkspacesResult",
  definition(t) {
    t.nonNull.list.nonNull.field("unauthorizedMemberDevices", {
      type: WorkspaceIdWithMemberDevices,
    });
  },
});

export const unauthorizedDevicesForWorkspacesQuery = queryField((t) => {
  t.field("unauthorizedDevicesForWorkspaces", {
    type: UnauthorizedDevicesForWorkspacesResult,
    async resolve(_root, _args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const userId = context.user.id;
      const unauthorizedMemberDevices = await getDevicesOfUnauthorizedUsers({
        userId,
      });
      return { unauthorizedMemberDevices };
    },
  });
});
