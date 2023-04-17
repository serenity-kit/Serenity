import {
  default as TiptapTableExtension,
  createTable,
} from "@tiptap/extension-table";
import { TextSelection } from "@tiptap/pm/state";

export const TableExtension = TiptapTableExtension.extend({
  // custom insert needed as tiptap renders an adiitional <div> around it's NodeViewContent,
  // even when setting as="table", resulting in a <table><div><tr>... situation we don't want
  // see sadly closed: https://github.com/ueberdosis/tiptap/issues/2675
  // and: https://github.com/ueberdosis/tiptap/issues/2892 for reference, which gave the idea
  // and is highly appreciated
  addCommands() {
    return {
      ...this.parent?.(),
      insertTable:
        ({ rows = 2, cols = 2, withHeaderRow = false } = {}) =>
        ({ editor, commands, tr, dispatch }) => {
          const node = createTable(editor.schema, rows, cols, withHeaderRow);

          if (dispatch) {
            const offset = tr.selection.anchor + 1;
            // this enables us to render the table inside our custom wrapper
            // to avoid wrapping the tables content into a div instead of a tbody
            // (see comment above)
            commands.insertContent({
              type: "table-wrapper",
              content: [node.toJSON()],
            });

            tr.scrollIntoView().setSelection(
              TextSelection.near(tr.doc.resolve(offset))
            );
          }

          return true;
        },
      deleteTable:
        () =>
        ({ state, dispatch }) => {
          let $pos = state.selection.$anchor;
          for (let d = $pos.depth; d > 0; d--) {
            let node = $pos.node(d);
            if (node.type.name === "table-wrapper") {
              if (dispatch) {
                dispatch(
                  state.tr
                    .delete($pos.before(d), $pos.after(d))
                    .scrollIntoView()
                );
              }
              return true;
            }
          }
          return false;
        },
    };
  },

  addStorage() {
    return {
      setTableActive: null,
    };
  },
});
