import { KeyDerivationTrace2 } from "@naisho/core";
import { CreatorDevice } from "./device";

export type Comment = {
  id: string;
  documentId: string;
  contentCiphertext: string;
  contentNonce: string;
  createdAt: Date;
  keyDerivationTrace: KeyDerivationTrace2;
  creatorDevice: CreatorDevice;
  commentReplies?: CommentReply[] | null;
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
};

export const formatCommentReply = (commentReply: any): CommentReply => {
  return {
    ...commentReply,
    keyDerivationTrace: commentReply.keyDerivationTrace as KeyDerivationTrace2,
  };
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
  return formmattedComment;
};
