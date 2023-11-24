import { objectType } from "nexus";
import { CreatorDevice } from "./device";

export const CommentReply = objectType({
  name: "CommentReply",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("commentId");
    t.nonNull.string("documentId");
    t.nonNull.string("snapshotId");
    t.nonNull.string("signature");
    t.nonNull.string("subkeyId");
    t.nonNull.string("contentCiphertext");
    t.nonNull.string("contentNonce");
    t.nonNull.field("createdAt", { type: "Date" });
    t.nonNull.field("creatorDevice", { type: CreatorDevice });
  },
});
