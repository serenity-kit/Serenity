import { objectType } from "nexus";

export const Device = objectType({
  name: "Device",
  definition(t) {
    // NOTE: userId is `String?` in prisma
    // but in practice should always be nonNull
    // however there is a typescript issue
    t.string("userId");
    t.nonNull.string("signingPublicKey");
    t.nonNull.string("encryptionPublicKey");
    t.nonNull.string("encryptionPublicKeySignature");
    t.field("createdAt", { type: "Date" });
    t.string("info");
  },
});

export const CreatorDevice = objectType({
  name: "Device",
  definition(t) {
    t.string("userId");
    t.nonNull.string("signingPublicKey");
    t.nonNull.string("encryptionPublicKey");
    t.nonNull.string("encryptionPublicKeySignature");
    t.field("createdAt", { type: "Date" });
  },
});
