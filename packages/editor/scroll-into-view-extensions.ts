import { Extension } from "@tiptap/core";

export interface ExtensionOptions {}

type Storage = {};

export const SerenityScrollIntoViewExtension = Extension.create<
  ExtensionOptions,
  Storage
>({
  name: "serenityScrollIntoViewExtension",

  addCommands() {
    return {
      scrollIntoView:
        () =>
        ({ commands }) => {
          let { from, to } = this.editor.state.selection;
          console.log("scrollIntoView");
          // let start = this.editor.view.coordsAtPos(from);
          let end = this.editor.view.coordsAtPos(to);
          this.editor.view.dom.parentElement?.parentElement?.scrollTo(
            0,
            end.top
          );
          return true;
        },
    };
  },
});
