// unauthorizedMembers(workspaceIds: ['abc', 'cde'])

import { AuthenticationError, UserInputError } from "apollo-server-express";
import { idArg, nonNull, objectType, queryField } from "nexus";
import { getWorkspaceDevices } from "../../../database/workspace/getWorkspaceDevices";
import { Device } from "../../types/device";

export const GetWorkspaceDevicesResult = objectType({
  name: "GetWorkspaceDevicesResult",
  definition(t) {
    t.nonNull.list.field("devices", { type: Device });
  },
});

export const workspaceDevicesQuery = queryField((t) => {
  // @ts-ignore sometimes the type is defined, sometimes not
  t.connectionField("workspaceDevices", {
    type: Device,
    disableBackwardPagination: true,
    cursorFromNode: (node) => node?.signingPublicKey ?? "",
    additionalArgs: {
      workspaceId: nonNull(idArg()),
    },
    async nodes(root, args, context) {
      if (args.first > 500) {
        throw new UserInputError(
          "Requested too many devices. First value exceeds 500."
        );
      }
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const cursor = args.after ? { signingPublicKey: args.after } : undefined;
      // prisma will include the cursor if skip: 1 is not set
      // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#do-i-always-have-to-skip-1
      const skip = cursor ? 1 : undefined;
      // include one extra project to set hasNextPage value
      const take: any = args.first ? args.first + 1 : undefined;

      const devices = getWorkspaceDevices({
        userId: context.user.id,
        workspaceId: args.workspaceId,
        cursor,
        skip,
        take,
      });
      return devices;
    },
  });
});
