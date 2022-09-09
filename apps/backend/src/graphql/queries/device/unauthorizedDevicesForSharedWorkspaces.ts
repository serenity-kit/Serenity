import { AuthenticationError } from "apollo-server-express";
import { objectType, queryField } from "nexus";
import { getDevicesOfUnauthorizedUsers } from "../../../database/device/getDevicesOfUnauthorizedUsers";
import { WorkspaceIdWithDevices } from "../../types/workspace";

export const UnauthorizedDeviceForSharedWorkspacesResult = objectType({
  name: "UnauthorizedDeviceForSharedWorkspacesResult",
  definition(t) {
    t.nonNull.list.nonNull.field("workspacesWithDevices", {
      type: WorkspaceIdWithDevices,
    });
  },
});

export const unauthorizedDevicesForSharedWorkspacesQuery = queryField((t) => {
  t.field("unauthorizedDevicesForSharedWorkspaces", {
    type: UnauthorizedDeviceForSharedWorkspacesResult,
    async resolve(_root, _args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const userId = context.user.id;
      const workspacesWithDevices = await getDevicesOfUnauthorizedUsers({
        userId,
      });
      return { workspacesWithDevices };
    },
  });
});
