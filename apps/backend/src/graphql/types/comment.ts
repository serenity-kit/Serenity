import { objectType } from "nexus";
import { CommentReply } from "./commentReply";
import { CreatorDevice } from "./device";
import { KeyDerivationTrace } from "./keyDerivation";

export const Comment = objectType({
  name: "Comment",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("documentId");
    t.nonNull.string("encryptedContent");
    t.nonNull.string("encryptedContentNonce");
    t.nonNull.field("contentKeyDerivationTrace", { type: KeyDerivationTrace });
    t.nonNull.field("creatorDevice", { type: CreatorDevice });
    t.list.field("commentReplies", { type: CommentReply });
  },
});
