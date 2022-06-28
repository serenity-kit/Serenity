import { nonNull, objectType } from "nexus";

export const Device = objectType({
  name: "Device",
  definition(t) {
    t.nonNull.string("userId");
    t.nonNull.string("signingPublicKey");
    t.nonNull.string("encryptionPublicKey");
    t.nonNull.string("encryptionPublicKeySignature");
    t.field("createdAt", { type: nonNull("Date") });
    t.string("info");
  },
});
