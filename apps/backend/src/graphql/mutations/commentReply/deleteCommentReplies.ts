import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { deleteCommentReplies } from "../../../database/commentreply/deleteCommentReplies";

export const DeleteCommentRepliesResult = objectType({
  name: "DeleteCommentRepliesResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const DeleteCommentRepliesInput = inputObjectType({
  name: "DeleteCommentRepliesInput",
  definition(t) {
    t.nonNull.list.nonNull.string("commentReplyIds");
  },
});

export const deleteCommentsMutation = mutationField("deleteCommentReplies", {
  type: DeleteCommentRepliesResult,
  args: {
    input: nonNull(
      arg({
        type: DeleteCommentRepliesInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    await deleteCommentReplies({
      userId: context.user.id,
      commentReplyIds: args.input.commentReplyIds,
    });
    return {
      status: "success",
    };
  },
});
