import { KeyDerivationTrace, KeyDerivationTrace2 } from "@naisho/core";
import { CreatorDevice } from "./device";

export type Comment = {
  id: string;
  documentId: string;
  encryptedContent: string;
  encryptedContentNonce: string;
  createdAt: Date;
  contentKeyDerivationTrace: KeyDerivationTrace;
  creatorDevice: CreatorDevice;
  commentReplies?: CommentReply[] | null;
};

export type CommentReply = {
  id: string;
  commentId: string;
  documentId: string;
  encryptedContent: string;
  encryptedContentNonce: string;
  createdAt: Date;
  contentKeyDerivationTrace: KeyDerivationTrace;
  creatorDevice: CreatorDevice;
  comment?: Comment | null;
};

export const formatCommentReply = (commentReply: any): CommentReply => {
  return {
    ...commentReply,
    contentKeyDerivationTrace:
      commentReply.contentKeyDerivationTrace as KeyDerivationTrace,
  };
};

export const formatComment = (comment: any): Comment => {
  const formmattedComment = {
    ...comment,
    keyDerivationTrace:
      comment.contentKeyDerivationTrace as KeyDerivationTrace2,
  };
  if (comment.commentReplies) {
    formmattedComment.commentReplies = comment.commentReplies.map(
      (commentReply: any) => formatCommentReply(commentReply)
    );
  }
  return formmattedComment;
};
