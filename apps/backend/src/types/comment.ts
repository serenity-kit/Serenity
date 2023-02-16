import { KeyDerivationTrace2 } from "@naisho/core";
import { CreatorDevice } from "./device";
import { formatWorkspaceKey, WorkspaceKey } from "./workspace";

export type Comment = {
  id: string;
  documentId: string;
  contentCiphertext: string;
  contentNonce: string;
  createdAt: Date;
  keyDerivationTrace: KeyDerivationTrace2;
  creatorDevice: CreatorDevice;
  commentReplies?: CommentReply[] | null;
  workspaceKey?: WorkspaceKey | null;
};

export type CommentReply = {
  id: string;
  commentId: string;
  documentId: string;
  contentCiphertext: string;
  contentNonce: string;
  createdAt: Date;
  keyDerivationTrace: KeyDerivationTrace2;
  creatorDevice: CreatorDevice;
  comment?: Comment | null;
  workspaceKey?: WorkspaceKey | null;
};

export const formatCommentReply = (commentReply: any): CommentReply => {
  const formattedCommentReply = {
    ...commentReply,
    keyDerivationTrace: commentReply.keyDerivationTrace as KeyDerivationTrace2,
  };
  if (commentReply.workspaceKey) {
    formattedCommentReply.workspaceKey = formatWorkspaceKey(
      commentReply.workspaceKey
    );
  }
  return formattedCommentReply;
};

export const formatComment = (comment: any): Comment => {
  const formmattedComment = {
    ...comment,
    keyDerivationTrace: comment.keyDerivationTrace as KeyDerivationTrace2,
  };
  if (comment.commentReplies) {
    formmattedComment.commentReplies = comment.commentReplies.map(
      (commentReply: any) => formatCommentReply(commentReply)
    );
  }
  if (comment.workspaceKey) {
    formmattedComment.workspaceKey = formatWorkspaceKey(comment.workspaceKey);
  }
  return formmattedComment;
};
