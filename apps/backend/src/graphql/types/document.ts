import { objectType } from "nexus";
import { WorkspaceKey } from "./workspace";

export const Document = objectType({
  name: "Document",
  definition(t) {
    t.nonNull.string("id");
    t.string("encryptedName");
    t.string("encryptedNameNonce");
    t.string("workspaceKeyId");
    t.field("workspaceKey", { type: WorkspaceKey });
    t.int("subkeyId");
    t.int("contentSubkeyId");
    t.string("parentFolderId");
    t.string("rootFolderId");
    t.string("workspaceId");
  },
});
