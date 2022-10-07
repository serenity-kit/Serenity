import { AuthenticationError, UserInputError } from "apollo-server-express";
import { booleanArg, nonNull, queryField } from "nexus";
import { getDevices } from "../../../database/device/getDevices";
import { DeviceWithRecentSession } from "../../types/device";

export const devices = queryField((t) => {
  // @ts-ignore sometimes the type is defined, sometimes not
  t.connectionField("devices", {
    type: DeviceWithRecentSession,
    disableBackwardPagination: true,
    cursorFromNode: (node) => node?.signingPublicKey ?? "",
    additionalArgs: {
      hasNonExpiredSession: nonNull(booleanArg()),
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
      const userId = context.user.id;
      const cursor = args.after ? { signingPublicKey: args.after } : undefined;
      // prisma will include the cursor if skip: 1 is not set
      // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#do-i-always-have-to-skip-1
      const skip = cursor ? 1 : undefined;
      // include one extra project to set hasNextPage value
      const take: any = args.first ? args.first + 1 : undefined;
      const hasNonExpiredSession = args.hasNonExpiredSession;

      const devices = await getDevices({
        hasNonExpiredSession,
        userId,
        cursor,
        skip,
        take,
      });
      return devices.map((device) => {
        if (!device.userId) {
          throw new UserInputError("Device without a userId");
        }
        return device;
      });
    },
  });
});
