import { objectType } from "nexus";

export const RecoveryDevice = objectType({
  name: "RecoveryDevice",
  definition(t) {
    t.nonNull.string("deviceSigningPublicKey");
    t.nonNull.string("deviceEncryptionPublicKey");
    t.nonNull.string("signatureForMainDeviceSigningPublicKey");
    t.nonNull.string("signatureForRecoveryDeviceSigningPublicKey");
  },
});
