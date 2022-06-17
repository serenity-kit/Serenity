import { queryField, objectType } from "nexus";

export const MainDeviceResult = objectType({
  name: "MainDeviceResult",
  definition(t) {
    t.nonNull.string("ciphertext");
    t.nonNull.string("nonce");
    t.nonNull.string("signingPublicKey");
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

      return {
        ciphertext: context.user.mainDeviceCiphertext,
        nonce: context.user.mainDeviceNonce,
        signingPublicKey: context.user.mainDeviceSigningPublicKey,
        encryptionKeySalt: context.user.mainDeviceEncryptionKeySalt,
      };
    },
  });
});
