import { verifyCommentReplySignature } from "@serenity-tools/common";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createCommentReply } from "../../../database/commentreply/createCommentReply";
import { CommentReply } from "../../types/commentReply";

export const CreateCommentReplyInput = inputObjectType({
  name: "CreateCommentReplyInput",
  definition(t) {
    t.nonNull.string("commentReplyId");
    t.nonNull.string("commentId");
    t.nonNull.string("snapshotId");
    t.nonNull.string("signature");
    t.string("workspaceMemberDevicesProofHash"); // either this or documentShareLinkToken has to be provided
    t.string("documentShareLinkToken");
    t.nonNull.string("subkeyId");
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

    const isValid = verifyCommentReplySignature({
      authorSigningPublicKey: context.session.deviceSigningPublicKey,
      ciphertext: args.input.contentCiphertext,
      nonce: args.input.contentNonce,
      signature: args.input.signature,
    });
    if (!isValid) {
      throw new Error("Invalid comment reply signature.");
    }

    if (args.input.documentShareLinkToken) {
      const commentReply = await createCommentReply({
        commentReplyId: args.input.commentReplyId,
        userId: context.user.id,
        creatorDeviceSigningPublicKey: context.session.deviceSigningPublicKey,
        commentId: args.input.commentId,
        snapshotId: args.input.snapshotId,
        documentShareLinkToken: args.input.documentShareLinkToken,
        subkeyId: args.input.subkeyId,
        contentCiphertext: args.input.contentCiphertext,
        contentNonce: args.input.contentNonce,
        signature: args.input.signature,
        workspaceMemberDevicesProofHash: undefined,
      });
      return { commentReply };
    } else if (!args.input.workspaceMemberDevicesProofHash) {
      throw new UserInputError(
        "Either documentShareLinkToken or workspaceMemberDevicesProofHash has to be provided."
      );
    }

    const commentReply = await createCommentReply({
      commentReplyId: args.input.commentReplyId,
      userId: context.user.id,
      creatorDeviceSigningPublicKey: context.session.deviceSigningPublicKey,
      commentId: args.input.commentId,
      snapshotId: args.input.snapshotId,
      documentShareLinkToken: undefined,
      subkeyId: args.input.subkeyId,
      contentCiphertext: args.input.contentCiphertext,
      contentNonce: args.input.contentNonce,
      signature: args.input.signature,
      workspaceMemberDevicesProofHash:
        args.input.workspaceMemberDevicesProofHash,
    });
    return { commentReply };
  },
});
