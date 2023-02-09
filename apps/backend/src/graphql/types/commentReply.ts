import { objectType } from "nexus";
import { CreatorDevice } from "./device";
import { KeyDerivationTrace } from "./keyDerivation";

export const CommentReply = objectType({
  name: "CommentReply",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("commentId");
    t.nonNull.string("documentId");
    t.nonNull.string("encryptedContent");
    t.nonNull.string("encryptedContentNonce");
    t.nonNull.date("createdAt");
    t.nonNull.field("contentKeyDerivationTrace", { type: KeyDerivationTrace });
    t.nonNull.field("creatorDevice", { type: CreatorDevice });
  },
});
