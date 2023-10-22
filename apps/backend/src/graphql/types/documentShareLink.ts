import { enumType, objectType } from "nexus";
import { CreatorDevice } from "./device";

export const ShareDocumentRoleEnum = enumType({
  name: "ShareDocumentRole",
  members: {
    EDITOR: "EDITOR",
    COMMENTER: "COMMENTER",
    VIEWER: "VIEWER",
  },
});

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
    t.nonNull.string("deviceSigningPublicKey");
  },
});

export const DocumentShareLinkForSharePage = objectType({
  name: "DocumentShareLinkForSharePage",
  definition(t) {
    t.nonNull.string("token");
    t.nonNull.string("websocketSessionKey");
    t.nonNull.string("workspaceId");
    t.nonNull.field("role", { type: ShareDocumentRoleEnum });
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
