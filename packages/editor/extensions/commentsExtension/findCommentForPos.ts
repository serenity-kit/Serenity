import { Editor } from "@tiptap/core";

type Params = {
  editor: Editor;
  pos: number;
};

export const findCommentForPos = ({ editor, pos }: Params) => {
  const state = editor.state;
  const commentsPlugin = state.plugins.find(
    // @ts-expect-error key exists on every plugin
    (plugin) => plugin.key === "comments$"
  );

  if (commentsPlugin) {
    const commentsState = commentsPlugin.getState(state);
    const comment = commentsState.comments.find((comment: any) => {
      return comment.absoluteFrom < pos && comment.absoluteTo > pos;
    });
    if (comment) {
      return comment;
    }
  }
};
