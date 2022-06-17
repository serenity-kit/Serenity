import { idArg, nonNull, queryField, objectType } from "nexus";
import { getDeviceBySigningPublicKey } from "../../../database/device/getDeviceBySigningPublicKey";
import { Device } from "../../types/device";

export const MainDeviceResult = objectType({
  name: "MainDeviceResult",
  definition(t) {
    t.nonNull.string("ciphertext");
    t.nonNull.string("nonce");
    t.nonNull.string("signingPublicKey");
    t.nonNull.string("encryptionPublicKey");
    t.nonNull.string("encryptionPublicKeySignature");
    t.nonNull.string("encryptionKeySalt");
  },
});

export const mainDeviceQuery = queryField((t) => {
  t.field("mainDevice", {
    type: MainDeviceResult,
    async resolve(root, args, context) {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      const userId = context.user.id;
      const device = await getDeviceBySigningPublicKey({
        userId,
        signingPublicKey: context.user.signingPublicKey,
      });

      return {
        mainDeviceCiphertext: context.user.mainDeviceCiphertext,
        mainDeviceNonce: context.user.mainDeviceNonce,
        signingPublicKey: device.signingPublicKey,
        encryptionPublicKey: device.encryptionPublicKey,
        encryptionPublicKeySignature: device.encryptionPublicKeySignature,
        encryptionKeySalt: context.user.mainDeviceEncryptionKeySalt,
      };
    },
  });
});
