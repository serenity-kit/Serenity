import create from "zustand";

interface DocumentNameState {
  name: string | null | undefined;
  update: (name: string | null | undefined) => void;
}

export const useDocumentNameStore = create<DocumentNameState>((set) => ({
  name: "",
  update: (name) =>
    set((state) => ({
      name,
    })),
}));
