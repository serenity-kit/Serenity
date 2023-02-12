import { objectType } from "nexus";
import { CreatorDevice } from "./device";
import { KeyDerivationTrace2 } from "./keyDerivation";

export const CommentReply = objectType({
  name: "CommentReply",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("commentId");
    t.nonNull.string("documentId");
    t.nonNull.string("contentCiphertext");
    t.nonNull.string("contentNonce");
    t.nonNull.field("createdAt", { type: "Date" });
    t.nonNull.field("keyDerivationTrace", { type: KeyDerivationTrace2 });
    t.nonNull.field("creatorDevice", { type: CreatorDevice });
  },
});
