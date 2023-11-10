import { verifyCommentSignature } from "@serenity-tools/common";
import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createComment } from "../../../database/comment/createComment";
import { Comment } from "../../types/comment";

export const CreateCommentInput = inputObjectType({
  name: "CreateCommentInput",
  definition(t) {
    t.nonNull.string("commentId");
    t.nonNull.string("contentCiphertext");
    t.nonNull.string("contentNonce");
    t.nonNull.string("signature");
    t.nonNull.string("snapshotId");
    t.string("documentShareLinkToken");
    t.nonNull.int("subkeyId");
  },
});

export const CreateCommentResult = objectType({
  name: "CreateCommentResult",
  definition(t) {
    t.field("comment", {
      type: Comment,
    });
  },
});

export const createCommentMutation = mutationField("createComment", {
  type: CreateCommentResult,
  args: {
    input: nonNull(
      arg({
        type: CreateCommentInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }

    const isValid = verifyCommentSignature({
      authorSigningPublicKey: context.session.deviceSigningPublicKey,
      ciphertext: args.input.contentCiphertext,
      nonce: args.input.contentNonce,
      signature: args.input.signature,
    });
    if (!isValid) {
      throw new Error("Invalid comment signature.");
    }

    const comment = await createComment({
      commentId: args.input.commentId,
      userId: context.user.id,
      creatorDeviceSigningPublicKey: context.session.deviceSigningPublicKey,
      snapshotId: args.input.snapshotId,
      documentShareLinkToken: args.input.documentShareLinkToken,
      subkeyId: args.input.subkeyId,
      contentCiphertext: args.input.contentCiphertext,
      contentNonce: args.input.contentNonce,
      signature: args.input.signature,
    });
    return { comment };
  },
});
