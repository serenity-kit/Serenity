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
import { KeyDerivationTraceInput } from "../../types/keyDerivation";

export const CreateCommentInput = inputObjectType({
  name: "CreateCommentInput",
  definition(t) {
    t.nonNull.string("documentId");
    t.nonNull.string("encryptedContent");
    t.nonNull.string("encryptedContentNonce");
    t.field("contentKeyDerivationTrace", {
      type: KeyDerivationTraceInput,
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
      encryptedContent: args.input.encryptedContent,
      encryptedContentNonce: args.input.encryptedContentNonce,
      contentKeyDerivationTrace: args.input.contentKeyDerivationTrace,
    });
    return { comment };
  },
});
