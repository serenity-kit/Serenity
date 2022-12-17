import { EditorBottombarState } from "@serenity-tools/editor";

export const initialEditorBottombarState: EditorBottombarState = {
  isBold: false,
  isItalic: false,
  isCode: false,
  isLink: false,
  isHeading1: false,
  isHeading2: false,
  isHeading3: false,
  isCodeBlock: false,
  isBlockquote: false,
  isBulletList: false,
  isOrderedList: false,
  isTaskList: false,
  canUndo: false,
  canRedo: false,
};
