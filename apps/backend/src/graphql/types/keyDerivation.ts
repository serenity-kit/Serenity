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

export const KeyDerivationTraceEntry = objectType({
  name: "KeyDerivationTraceEntry",
  definition(t) {
    t.nonNull.string("entryId");
    t.nonNull.int("subkeyId");
    t.nonNull.string("context");
    t.string("parentId");
  },
});

export const KeyDerivationTrace2 = objectType({
  name: "KeyDerivationTrace2",
  definition(t) {
    t.nonNull.string("workspaceKeyId");
    t.nonNull.list.nonNull.field("trace", {
      type: KeyDerivationTraceEntry,
    });
  },
});

export const KeyDerivationTraceEntryInput = inputObjectType({
  name: "KeyDerivationTraceEntryInput",
  definition(t) {
    t.nonNull.string("entryId");
    t.nonNull.int("subkeyId");
    t.nonNull.string("context");
    t.string("parentId");
  },
});

export const KeyDerivationTraceInput2 = inputObjectType({
  name: "KeyDerivationTraceInput2",
  definition(t) {
    t.nonNull.string("workspaceKeyId");
    t.nonNull.list.nonNull.field("trace", {
      type: KeyDerivationTraceEntryInput,
    });
  },
});
