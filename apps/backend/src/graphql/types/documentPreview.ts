import { objectType } from "nexus";

export const DocumentPreview = objectType({
  name: "DocumentPreview",
  definition(t) {
    t.nonNull.string("documentId");
  },
});
