import { objectType } from "nexus";

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
  },
});
