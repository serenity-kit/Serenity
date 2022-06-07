import { idArg, nonNull, queryField } from "nexus";
import { getDeviceBySigningPublicKey } from "../../../database/device/getDeviceBySigningPublicKey";
import { Device } from "../../types/device";

export const deviceBySigningPublicKey = queryField((t) => {
  t.field("deviceBySigningPublicKey", {
    type: Device,
    args: {
      signingPublicKey: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      const userId = context.user.id;
      const device = await getDeviceBySigningPublicKey({
        userId,
        signingPublicKey: args.signingPublicKey,
      });
      return device;
    },
  });
});
