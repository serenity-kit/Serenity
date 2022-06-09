import { objectType } from "nexus";

export const RecoveryDevice = objectType({
  name: "RecoveryDevice",
  definition(t) {
    t.nonNull.string("userId");
    t.nonNull.string("ciphertext");
    t.nonNull.string("nonce");
    t.nonNull.string("deviceSigningPublicKey");
    t.string("deviceSigningPrivateKey");
    t.nonNull.string("deviceSigningKeyType");
    t.nonNull.string("deviceEncryptionPublicKey");
    t.string("deviceEncryptionPrivateKey");
    t.nonNull.string("deviceEncryptionKeyType");
    t.nonNull.string("signatureForMainDeviceSigningPublicKey");
    t.nonNull.string("signatureForRecoveryDeviceSigningPublicKey");
  },
});
