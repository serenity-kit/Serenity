import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createComment } from "../../../database/comment/createComment";
import { formatComment } from "../../../types/comment";
import { Comment } from "../../types/comment";
import { KeyDerivationTraceInput2 } from "../../types/keyDerivation";

export const CreateCommentInput = inputObjectType({
  name: "CreateCommentInput",
  definition(t) {
    t.nonNull.string("documentId");
    t.nonNull.string("contentCiphertext");
    t.nonNull.string("contentNonce");
    t.nonNull.field("keyDerivationTrace", {
      type: KeyDerivationTraceInput2,
    });
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
    const comment = await createComment({
      userId: context.user.id,
      creatorDeviceSigningPublicKey: context.session.deviceSigningPublicKey,
      documentId: args.input.documentId,
      contentCiphertext: args.input.contentCiphertext,
      contentNonce: args.input.contentNonce,
      keyDerivationTrace: args.input.keyDerivationTrace,
    });
    return { comment: formatComment(comment) };
  },
});
