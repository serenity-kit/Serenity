import { objectType } from "nexus";

export const Device = objectType({
  name: "DocumDeviceent",
  definition(t) {
    t.nonNull.string("signingPublicKey");
    t.nonNull.string("encryptionPublicKey");
    t.nonNull.string("encryptionPublicKeySignature");
    t.nonNull.string("userId");
    t.string("recoveryDevice");
  },
});
