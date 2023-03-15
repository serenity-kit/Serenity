import { Editor } from "@tiptap/core";
import { EditorComment, HighlightedComment } from "../../types";
import { scrollToPos } from "../../utils/scrollToPos";

export const updateCommentsDataAndScrollToHighlighted = (
  editor: Editor,
  comments: EditorComment[],
  highlightedComment: HighlightedComment | null
) => {
  const shouldScrollToHighlightedComment =
    highlightedComment?.id &&
    editor.storage?.comments &&
    highlightedComment.id !== editor.storage.comments.highlightedComment?.id &&
    highlightedComment.source === "sidebar";

  editor.storage.comments.comments = comments;
  editor.storage.comments.highlightedComment = highlightedComment;

  // empty transaction to make sure the comments are updated
  editor.view.dispatch(editor.view.state.tr);
  if (
    shouldScrollToHighlightedComment &&
    editor.storage.comments.highlightedCommentFromPos !== null
  ) {
    scrollToPos(editor.view, editor.storage.comments.highlightedCommentFromPos);
  }
};
