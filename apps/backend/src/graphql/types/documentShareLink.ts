import { objectType } from "nexus";
import { CreatorDevice } from "./device";

export const SnapshotKeyBox = objectType({
  name: "SnapshotKeyBox",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("deviceSigningPublicKey");
    t.nonNull.string("creatorDeviceSigningPublicKey");
    t.nonNull.string("nonce");
    t.nonNull.string("ciphertext");
    t.nonNull.field("creatorDevice", { type: CreatorDevice });
  },
});

export const DocumentShareLink = objectType({
  name: "DocumentShareLink",
  definition(t) {
    t.nonNull.string("token");
    t.nonNull.string("deviceSecretBoxCiphertext");
    t.nonNull.string("deviceSecretBoxNonce");
    t.nonNull.string("deviceSigningPublicKey");
    t.nonNull.string("deviceEncryptionPublicKey");
    t.nonNull.string("deviceEncryptionPublicKeySignature");
    t.list.nonNull.field("snapshotKeyBoxs", {
      type: SnapshotKeyBox,
    });
  },
});
