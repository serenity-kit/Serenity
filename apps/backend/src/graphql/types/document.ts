import { inputObjectType, objectType } from "nexus";
import { KeyDerivationTraceInput } from "./keyDerivation";
import { WorkspaceKey } from "./workspace";

export const Document = objectType({
  name: "Document",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("nameCiphertext");
    t.nonNull.string("nameNonce");
    t.nonNull.int("subkeyId");
    t.string("parentFolderId");
    t.string("rootFolderId");
    t.nonNull.string("workspaceId");
    t.field("workspaceKey", { type: WorkspaceKey });
  },
});

export const DocumentSnapshotPublicDataParentSnapshotClocksInput =
  inputObjectType({
    name: "DocumentSnapshotPublicDataParentSnapshotClocksInput",
    definition(t) {
      t.string("dummy"); // optional
    },
  });

export const DocumentSnapshotPublicDataInput = inputObjectType({
  name: "DocumentSnapshotPublicDataInput",
  definition(t) {
    t.nonNull.string("docId");
    t.nonNull.string("pubKey");
    t.string("snapshotId");
    t.nonNull.field("keyDerivationTrace", { type: KeyDerivationTraceInput });
    t.nonNull.string("parentSnapshotProof");
    t.nonNull.field("parentSnapshotClocks", {
      type: DocumentSnapshotPublicDataParentSnapshotClocksInput,
    });
  },
});

export const DocumentSnapshotInput = inputObjectType({
  name: "DocumentSnapshotInput",
  definition(t) {
    t.nonNull.string("ciphertext");
    t.nonNull.string("nonce");
    t.nonNull.string("signature");
    t.nonNull.field("publicData", { type: DocumentSnapshotPublicDataInput });
  },
});
