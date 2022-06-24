import create from "zustand";
import { Document } from "../../generated/graphql";

interface DocumentState {
  document: Document | null | undefined;
  update: (document: Document | null | undefined) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  document: null,
  update: (document) =>
    set((state) => ({
      document,
    })),
}));
