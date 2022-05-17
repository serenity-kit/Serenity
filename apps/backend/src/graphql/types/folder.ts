import { objectType, list } from "nexus";

export const Folder = objectType({
  name: "Folder",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
    t.string("parentFolderId");
    t.string("rootFolderId");
    t.string("workspaceId");
    t.list.nonNull.field("parentFolders", {
      type: Folder,
    });
  },
});
