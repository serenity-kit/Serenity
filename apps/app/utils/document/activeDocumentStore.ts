import create from "zustand";

interface ActiveDocumentState {
  activeDocumentId: string | null;
  setActiveDocumentId: (params: { documentId: string }) => void;
}

export const useActiveDocumentStore = create<ActiveDocumentState>(
  (set, get) => ({
    activeDocumentId: null,
    setActiveDocumentId: ({ documentId }) => {
      set(() => ({
        activeDocumentId: documentId,
      }));
    },
  })
);
