import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createCommentReply } from "../../../database/commentreply/createCommentReply";
import { CommentReply } from "../../types/commentReply";
import { KeyDerivationTraceInput } from "../../types/keyDerivation";

export const CreateCommentReplyInput = inputObjectType({
  name: "CreateCommentReplyInput",
  definition(t) {
    t.nonNull.string("commentId");
    t.nonNull.string("documentId");
    t.nonNull.string("encryptedContent");
    t.nonNull.string("encryptedContentNonce");
    t.field("contentKeyDerivationTrace", {
      type: KeyDerivationTraceInput,
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
      encryptedContent: args.input.encryptedContent,
      encryptedContentNonce: args.input.encryptedContentNonce,
      contentKeyDerivationTrace: args.input.contentKeyDerivationTrace,
    });
    return { commentReply };
  },
});
