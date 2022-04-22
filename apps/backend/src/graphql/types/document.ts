import { objectType } from "nexus";

export const Document = objectType({
  name: "Document",
  definition(t) {
    t.nonNull.string("documentId");
  },
});
