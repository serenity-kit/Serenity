import { Extension } from "@tiptap/core";
import { Node as ProsemirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface ExtensionOptions {}

type Storage = {
  searchTerm: string | undefined;
  goToNext: boolean;
  goToPrevious: boolean;
  _previousSearchTerm: string | undefined;
  _activeIndex: number | undefined;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    searchExtension: {
      updateSearchTerm: (searchTerm: string) => ReturnType;
      goToNextResult: () => ReturnType;
      goToPreviousResult: () => ReturnType;
      clearSearch: () => ReturnType;
      scrollSearchResultIntoView: () => ReturnType;
    };
  }
}

function highlight(doc: ProsemirrorNode, storage: Storage) {
  const { searchTerm } = storage;
  if (!searchTerm || storage._previousSearchTerm !== searchTerm) {
    storage._activeIndex = undefined;
    storage.goToNext = false;
    storage.goToPrevious = false;
  }
  storage._previousSearchTerm = searchTerm;
  if (!searchTerm) {
    return DecorationSet.empty;
  }

  if (storage.goToNext) {
    storage._activeIndex = (storage._activeIndex || 0) + 1;
  } else if (storage.goToPrevious) {
    storage._activeIndex = (storage._activeIndex || 0) - 1;
  } else {
    storage._activeIndex = 0;
  }

  storage.goToNext = false;
  storage.goToPrevious = false;

  const decorations: [any?] = [];

  doc.descendants((node: any, position: number) => {
    if (!node.isText) {
      return;
    }

    const regex = new RegExp(searchTerm, "ig");
    const matches = node.text.matchAll(regex);

    for (const match of matches) {
      decorations.push(
        Decoration.inline(
          position + match.index,
          position + match.index + searchTerm.length,
          {
            class: "serenity-editor-search-result",
          }
        )
      );
    }
  });

  if (decorations.length === 0) {
    return DecorationSet.empty;
  }

  if (storage._activeIndex < 0) {
    // in case of going to minus start from the end
    // using + here since the value is minus anyway
    storage._activeIndex = decorations.length + storage._activeIndex;
  } else {
    // make sure to not go out of the upper bound
    // module makes sure it can never go over the length
    storage._activeIndex = storage._activeIndex % decorations.length;
  }

  decorations[storage._activeIndex] = Decoration.inline(
    decorations[storage._activeIndex].from,
    decorations[storage._activeIndex].to,
    {
      class: "serenity-editor-search-result-active",
    }
  );

  return DecorationSet.create(doc, decorations);
}

export const SearchExtension = Extension.create<ExtensionOptions, Storage>({
  name: "documentSearch",

  addCommands() {
    return {
      updateSearchTerm:
        (searchTerm) =>
        ({ commands, editor }) => {
          editor.storage.documentSearch.searchTerm = searchTerm;
          return true;
        },
      goToNextResult:
        () =>
        ({ commands, editor }) => {
          editor.storage.documentSearch.goToNext = true;
          return true;
        },
      goToPreviousResult:
        () =>
        ({ commands, editor }) => {
          editor.storage.documentSearch.goToPrevious = true;
          return true;
        },
      scrollSearchResultIntoView: () => () => {
        document
          .querySelector(".serenity-editor-search-result-active")
          ?.scrollIntoView({
            behavior: "smooth",
          });
        return true;
      },
    };
  },

  addProseMirrorPlugins() {
    const storage = this.editor.storage;

    return [
      new Plugin({
        key: new PluginKey("in-page-search"),
        state: {
          init(_, { doc }) {
            return highlight(doc, storage.documentSearch);
          },
          apply(transaction, oldState) {
            // several checks to prevent a lot of recomputation
            return transaction.docChanged ||
              storage.documentSearch.searchTerm !==
                storage.documentSearch._previousSearchTerm ||
              storage.documentSearch.goToNext ||
              storage.documentSearch.goToPrevious
              ? highlight(transaction.doc, storage.documentSearch)
              : oldState;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
