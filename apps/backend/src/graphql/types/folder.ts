import { objectType } from "nexus";
import { WorkspaceKey } from "./workspace";

export const KeyDerivationTraceParentFolder = objectType({
  name: "KeyDerivationTraceParentFolder",
  definition(t) {
    t.nonNull.string("folderId");
    t.nonNull.int("subkeyId");
    t.string("parentFolderId");
  },
});

export const KeyDerivationTrace = objectType({
  name: "KeyDerivationTrace",
  definition(t) {
    t.nonNull.string("workspaceKeyId");
    t.nonNull.list.nonNull.field("parentFolders", {
      type: KeyDerivationTraceParentFolder,
    });
  },
});

export const Folder = objectType({
  name: "Folder",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("encryptedName");
    t.nonNull.string("encryptedNameNonce");
    t.nonNull.int("subkeyId");
    t.string("parentFolderId");
    t.string("rootFolderId");
    t.string("workspaceId");
    t.string("workspaceKeyId");
    t.nonNull.field("keyDerivationTrace", { type: KeyDerivationTrace });
    t.field("workspaceKey", { type: WorkspaceKey });
  },
});
