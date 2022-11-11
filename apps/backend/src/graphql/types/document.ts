import { inputObjectType, objectType } from "nexus";
import { KeyDerivationTraceInput } from "../mutations/folder/createFolder";
import { KeyDerivationTrace } from "./folder";
import { WorkspaceKey } from "./workspace";

export const Document = objectType({
  name: "Document",
  definition(t) {
    t.nonNull.string("id");
    t.string("encryptedName");
    t.string("encryptedNameNonce");
    t.string("workspaceKeyId");
    t.field("workspaceKey", { type: WorkspaceKey });
    t.int("subkeyId");
    t.int("contentSubkeyId");
    t.string("parentFolderId");
    t.string("rootFolderId");
    t.string("workspaceId");
    t.nonNull.field("nameKeyDerivationTrace", { type: KeyDerivationTrace });
    t.field("workspaceKey", { type: WorkspaceKey });
  },
});

export const DocumentSnapshotPublicDataInput = inputObjectType({
  name: "DocumentSnapshotPublicDataInput",
  definition(t) {
    t.nonNull.string("docId");
    t.nonNull.string("pubKey");
    t.nonNull.string("snapshotId");
    // TODO make it nonNull
    t.field("keyDerivationTrace", { type: KeyDerivationTraceInput });
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
