import { inputObjectType, objectType } from "nexus";

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
    t.nonNull.int("subkeyId");
    t.nonNull.list.nonNull.field("parentFolders", {
      type: KeyDerivationTraceParentFolder,
    });
  },
});

export const KeyDerivationTraceParentFolderInput = inputObjectType({
  name: "KeyDerivationTraceParentFolderInput",
  definition(t) {
    t.nonNull.string("folderId");
    t.nonNull.int("subkeyId");
    t.string("parentFolderId");
  },
});

export const KeyDerivationTraceInput = inputObjectType({
  name: "KeyDerivationTraceInput",
  definition(t) {
    t.nonNull.string("workspaceKeyId");
    t.nonNull.int("subkeyId");
    t.nonNull.list.nonNull.field("parentFolders", {
      type: KeyDerivationTraceParentFolderInput,
    });
  },
});
