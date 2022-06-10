import { objectType } from "nexus";

export const Device = objectType({
  name: "Device",
  definition(t) {
    t.nonNull.string("userId");
    t.nonNull.string("signingPublicKey");
    t.string("signingPrivateKey");
    t.nonNull.string("signingKeyType");
    t.nonNull.string("encryptionPublicKey");
    t.nonNull.string("encryptionKeyType");
    t.string("encryptionPrivateKey");
    t.nonNull.string("encryptionPublicKeySignature");

    t.string("ciphertext");
    t.string("nonce");
  },
});
