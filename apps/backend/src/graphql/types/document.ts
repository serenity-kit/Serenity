import { objectType } from "nexus";
import { KeyDerivationTrace } from "./folder";
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
    t.nonNull.field("nameKeyDerivationTrace", { type: KeyDerivationTrace });
    // t.nonNull.field("contentKeyDerivationTrace", { type: KeyDerivationTrace });
    t.field("workspaceKey", { type: WorkspaceKey });
  },
});
