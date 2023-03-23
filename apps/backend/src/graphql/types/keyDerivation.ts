import { inputObjectType, objectType } from "nexus";

export const KeyDerivationTraceEntry = objectType({
  name: "KeyDerivationTraceEntry",
  definition(t) {
    t.nonNull.string("entryId");
    t.nonNull.int("subkeyId");
    t.nonNull.string("context");
    t.string("parentId");
  },
});

export const KeyDerivationTrace = objectType({
  name: "KeyDerivationTrace",
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

export const KeyDerivationTraceInput = inputObjectType({
  name: "KeyDerivationTraceInput",
  definition(t) {
    t.nonNull.string("workspaceKeyId");
    t.nonNull.list.nonNull.field("trace", {
      type: KeyDerivationTraceEntryInput,
    });
  },
});
