import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { deleteComments } from "../../../database/comment/deleteComments";

export const DeleteCommentsResult = objectType({
  name: "DeleteCommentsResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const DeleteCommentsInput = inputObjectType({
  name: "DeleteCommentsInput",
  definition(t) {
    t.nonNull.list.nonNull.string("commentIds");
    t.string("documentShareLinkToken");
  },
});

export const deleteCommentsMutation = mutationField("deleteComments", {
  type: DeleteCommentsResult,
  args: {
    input: nonNull(
      arg({
        type: DeleteCommentsInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    await deleteComments({
      userId: context.user.id,
      commentIds: args.input.commentIds,
      documentShareLinkToken: args.input.documentShareLinkToken,
    });
    return {
      status: "success",
    };
  },
});
