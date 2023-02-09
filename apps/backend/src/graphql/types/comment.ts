import { objectType } from "nexus";
import { CreatorDevice } from "./device";

export const Comment = objectType({
  name: "Comment",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("documentId");
    t.nonNull.string("encryptedContent");
    t.nonNull.string("encryptedContentNonce");
    t.nonNull.field("creatorDevice", { type: CreatorDevice });
  },
});
