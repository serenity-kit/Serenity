import { objectType } from "nexus";
import { Document } from "./document";
import { KeyDerivationTrace } from "./keyDerivation";

export const Update = objectType({
  name: "Update",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.int("version");
    t.nonNull.string("data");
    t.nonNull.string("snapshotId");
    t.field("snapshot", { type: Snapshot });
    t.nonNull.int("clock");
    t.nonNull.string("pubKey");
  },
});

export const Snapshot = objectType({
  name: "Snapshot",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("data");
    t.field("document", { type: Document });
    t.nonNull.string("documentId");
    t.list.nonNull.field("updates", { type: Update });
    t.field("activeDocumentSnapshot", { type: Document });
    t.nonNull.field("createdAt", { type: "Date" });
    t.nonNull.field("keyDerivationTrace", { type: KeyDerivationTrace });
    t.nonNull.list.nonNull.int("clocks");
  },
});
