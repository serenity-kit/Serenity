import { objectType } from "nexus";
import { CreatorDevice } from "./device";

export const CommentReply = objectType({
  name: "CommentReply",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("commentId");
    t.nonNull.string("documentId");
    t.nonNull.string("encryptedContent");
    t.nonNull.string("encryptedContentNonce");
    t.nonNull.field("creatorDevice", { type: CreatorDevice });
  },
});
