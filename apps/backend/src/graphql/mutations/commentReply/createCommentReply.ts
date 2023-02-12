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
import { KeyDerivationTraceInput2 } from "../../types/keyDerivation";

export const CreateCommentReplyInput = inputObjectType({
  name: "CreateCommentReplyInput",
  definition(t) {
    t.nonNull.string("commentId");
    t.nonNull.string("documentId");
    t.nonNull.string("contentCiphertext");
    t.nonNull.string("contentNonce");
    t.nonNull.field("keyDerivationTrace", {
      type: KeyDerivationTraceInput2,
    });
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
      documentId: args.input.documentId,
      contentCiphertext: args.input.contentCiphertext,
      contentNonce: args.input.contentNonce,
      keyDerivationTrace: args.input.keyDerivationTrace,
    });
    return { commentReply: formatCommentReply(commentReply) };
  },
});
