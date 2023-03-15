import { EditorView } from "@tiptap/pm/view";

export const scrollToPos = (editorView: EditorView, pos: number) => {
  const end = editorView.coordsAtPos(pos);
  const scrollTop = editorView.dom.parentElement?.parentElement?.scrollTop || 0;
  editorView.dom.parentElement?.parentElement?.scrollTo({
    // covers the editor toolbar plus some space to not end up at the very bottom
    top: end.top + scrollTop - 300,
    behavior: "smooth", // jfyi not supported on iOS Safari
  });
  return true;
};
