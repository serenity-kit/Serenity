import { inputObjectType, objectType } from "nexus";
import { KeyDerivationTraceInput2 } from "./keyDerivation";
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

export const DocumentSnapshotPublicDataInput = inputObjectType({
  name: "DocumentSnapshotPublicDataInput",
  definition(t) {
    t.nonNull.string("docId");
    t.nonNull.string("pubKey");
    t.string("snapshotId");
    // TODO make it nonNull
    t.nonNull.field("keyDerivationTrace", { type: KeyDerivationTraceInput2 });
    t.int("subkeyId");
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
