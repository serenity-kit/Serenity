import { nonNull, objectType } from "nexus";
import { CommentReply } from "./commentReply";
import { CreatorDevice } from "./device";
import { KeyDerivationTrace2 } from "./keyDerivation";

export const Comment = objectType({
  name: "Comment",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("documentId");
    t.nonNull.string("contentCiphertext");
    t.nonNull.string("contentNonce");
    t.nonNull.field("createdAt", { type: nonNull("Date") });
    t.nonNull.field("keyDerivationTrace", { type: KeyDerivationTrace2 });
    t.nonNull.field("creatorDevice", { type: CreatorDevice });
    t.list.field("commentReplies", { type: CommentReply });
  },
});
