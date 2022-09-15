import { AuthenticationError } from "apollo-server-express";
import { idArg, nonNull, objectType, queryField } from "nexus";
import { getRelatedDeviceBySigningPublicKey } from "../../../database/device/getRelatedDeviceBySigningPublicKey";
import { Device } from "../../types/device";

export const RelatedDeviceResult = objectType({
  name: "RelatedDeviceResult",
  definition(t) {
    t.field("device", { type: Device });
  },
});

export const relatedDeviceBySigningPublicKey = queryField((t) => {
  t.field("relatedDeviceBySigningPublicKey", {
    type: RelatedDeviceResult,
    args: {
      signingPublicKey: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const userId = context.user.id;
      const device = await getRelatedDeviceBySigningPublicKey({
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
