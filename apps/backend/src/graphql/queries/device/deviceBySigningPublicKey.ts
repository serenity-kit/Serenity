import { AuthenticationError } from "apollo-server-express";
import { idArg, nonNull, objectType, queryField } from "nexus";
import { getDeviceBySigningPublicKey } from "../../../database/device/getDeviceBySigningPublicKey";
import { Device } from "../../types/device";

export const DeviceResult = objectType({
  name: "DeviceResult",
  definition(t) {
    t.field("device", { type: Device });
  },
});

export const deviceBySigningPublicKeyQuery = queryField((t) => {
  t.field("deviceBySigningPublicKey", {
    type: DeviceResult,
    args: {
      signingPublicKey: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const userId = context.user.id;
      const device = await getDeviceBySigningPublicKey({
        userId,
        signingPublicKey: args.signingPublicKey,
      });
      if (!device.userId) {
        throw new Error("UserId missing");
      }
      return {
        device: {
          encryptionPublicKey: device.encryptionPublicKey,
          encryptionPublicKeySignature: device.encryptionPublicKeySignature,
          signingPublicKey: device.signingPublicKey,
          userId: device.userId,
          info: device.info,
          createdAt: device.createdAt,
        },
      };
    },
  });
});
