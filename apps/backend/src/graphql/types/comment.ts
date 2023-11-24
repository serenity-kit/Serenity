import { nonNull, objectType } from "nexus";
import { CommentReply } from "./commentReply";
import { CreatorDevice } from "./device";

export const Comment = objectType({
  name: "Comment",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("documentId");
    t.nonNull.string("snapshotId");
    t.nonNull.string("signature");
    t.nonNull.string("subkeyId");
    t.nonNull.string("contentCiphertext");
    t.nonNull.string("contentNonce");
    t.nonNull.field("createdAt", { type: nonNull("Date") });
    t.nonNull.field("creatorDevice", { type: CreatorDevice });
    t.list.field("commentReplies", { type: CommentReply });
  },
});
