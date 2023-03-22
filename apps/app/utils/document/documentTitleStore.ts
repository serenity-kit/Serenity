import create from "zustand";

interface DocumentState {
  activeDocumentId: string | null;
  activeDocumentTitle: string | null;
  documentTitles: { [documentId: string]: string };
  setActiveDocumentId: (params: { documentId: string }) => void;
  updateDocumentTitle: (params: { documentId: string; title: string }) => void;
}

export const useDocumentTitleStore = create<DocumentState>((set, get) => ({
  activeDocumentId: null,
  activeDocumentTitle: null,
  documentTitles: {},
  setActiveDocumentId: ({ documentId }) => {
    set(() => ({
      activeDocumentId: documentId,
      activeDocumentTitle: get().documentTitles[documentId],
    }));
  },
  updateDocumentTitle: ({ documentId, title }) => {
    let state = get();
    let documentTitles = state.documentTitles;
    documentTitles[documentId] = title;
    set(() => ({
      documentTitles,
      activeDocumentTitle:
        documentId === state.activeDocumentId
          ? title
          : state.activeDocumentTitle,
    }));
  },
}));
