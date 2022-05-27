import { objectType } from "nexus";

export const Document = objectType({
  name: "Document",
  definition(t) {
    t.nonNull.string("id");
    t.string("name");
    t.string("parentFolderId");
    t.string("rootFolderId");
    t.string("workspaceId");
  },
});
