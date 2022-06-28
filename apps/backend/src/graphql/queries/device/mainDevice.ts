import { queryField, objectType } from "nexus";
import { getDeviceBySigningPublicKey } from "../../../database/device/getDeviceBySigningPublicKey";

export const MainDeviceResult = objectType({
  name: "MainDeviceResult",
  definition(t) {
    t.nonNull.string("ciphertext");
    t.nonNull.string("nonce");
    t.nonNull.string("signingPublicKey");
    t.nonNull.string("encryptionPublicKey");
    t.nonNull.string("encryptionKeySalt");
    t.nonNull.date("createdAt");
    t.string("info");
  },
});

export const mainDeviceQuery = queryField((t) => {
  t.field("mainDevice", {
    type: MainDeviceResult,
    async resolve(root, args, context) {
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      const device = await getDeviceBySigningPublicKey({
        userId: context.user.id,
        signingPublicKey: context.user.mainDeviceSigningPublicKey,
      });

      return {
        ciphertext: context.user.mainDeviceCiphertext,
        nonce: context.user.mainDeviceNonce,
        signingPublicKey: context.user.mainDeviceSigningPublicKey,
        encryptionPublicKey: device.encryptionPublicKey,
        encryptionKeySalt: context.user.mainDeviceEncryptionKeySalt,
        info: device.info,
        createdAt: device.createdAt,
      };
    },
  });
});
