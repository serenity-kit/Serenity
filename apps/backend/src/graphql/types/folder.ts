import { objectType } from "nexus";
import { KeyDerivationTrace } from "./keyDerivation";
import { WorkspaceKey } from "./workspace";

export const Folder = objectType({
  name: "Folder",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("nameCiphertext");
    t.nonNull.string("nameNonce");
    t.string("parentFolderId");
    t.string("rootFolderId");
    t.string("workspaceId");
    t.nonNull.field("keyDerivationTrace", { type: KeyDerivationTrace });
    t.field("workspaceKey", { type: WorkspaceKey });
  },
});
