import { Extension } from "@tiptap/core";

export interface ExtensionOptions {}

type Storage = {};

export const SerenityScrollIntoViewExtension = Extension.create<
  ExtensionOptions,
  Storage
>({
  name: "serenityScrollIntoViewExtension",

  addCommands() {
    alert("add COMMANDS");
    return {
      scrollIntoView:
        () =>
        ({ commands }) => {
          let { from, to } = this.editor.state.selection;
          // let start = this.editor.view.coordsAtPos(from);
          let end = this.editor.view.coordsAtPos(to);
          alert("scrollIntoView");
          this.editor.view.dom.parentElement?.parentElement?.scrollTo(
            0,
            end.top + 200 // covers the editor toolbar plus some space to not end up at the very bottom
          );
          return true;
        },
    };
  },
});
