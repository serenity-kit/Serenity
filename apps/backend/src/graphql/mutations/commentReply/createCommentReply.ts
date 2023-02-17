import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createCommentReply } from "../../../database/commentreply/createCommentReply";
import { formatCommentReply } from "../../../types/comment";
import { CommentReply } from "../../types/commentReply";

export const CreateCommentReplyInput = inputObjectType({
  name: "CreateCommentReplyInput",
  definition(t) {
    t.nonNull.string("commentId");
    t.nonNull.string("snapshotId");
    t.nonNull.int("subkeyId");
    t.nonNull.string("contentCiphertext");
    t.nonNull.string("contentNonce");
  },
});

export const CreateCommentReplyResult = objectType({
  name: "CreateCommentReplyResult",
  definition(t) {
    t.field("commentReply", {
      type: CommentReply,
    });
  },
});

export const createCommentReplyMutation = mutationField("createCommentReply", {
  type: CreateCommentReplyResult,
  args: {
    input: nonNull(
      arg({
        type: CreateCommentReplyInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    const commentReply = await createCommentReply({
      userId: context.user.id,
      creatorDeviceSigningPublicKey: context.session.deviceSigningPublicKey,
      commentId: args.input.commentId,
      snapshotId: args.input.snapshotId,
      subkeyId: args.input.subkeyId,
      contentCiphertext: args.input.contentCiphertext,
      contentNonce: args.input.contentNonce,
    });
    return { commentReply: formatCommentReply(commentReply) };
  },
});
