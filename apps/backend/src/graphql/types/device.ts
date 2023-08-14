import { inputObjectType, objectType } from "nexus";

export const Device = objectType({
  name: "Device",
  definition(t) {
    t.nonNull.string("userId");
    t.nonNull.string("signingPublicKey");
    t.nonNull.string("encryptionPublicKey");
    t.nonNull.string("encryptionPublicKeySignature");
    t.field("createdAt", { type: "Date" });
    t.string("info");
  },
});

export const CreatorDevice = objectType({
  name: "CreatorDevice",
  definition(t) {
    t.nonNull.string("signingPublicKey");
    t.nonNull.string("encryptionPublicKey");
    t.nonNull.string("encryptionPublicKeySignature");
    t.field("createdAt", { type: "Date" });
  },
});

export const DeviceInput = inputObjectType({
  name: "DeviceInput",
  definition(t) {
    t.nonNull.string("userId");
    t.nonNull.string("signingPublicKey");
    t.nonNull.string("encryptionPublicKey");
    t.nonNull.string("encryptionPublicKeySignature");
    t.nonNull.field("createdAt", { type: "Date" });
    t.string("info");
  },
});
