import create from "zustand";
import { Folder } from "../../generated/graphql";

interface DocumentPathState {
  folders: Folder[];
  update: (folders: Folder[]) => void;
}

export const useDocumentPathStore = create<DocumentPathState>((set) => ({
  folders: [],
  update: (folders) =>
    set((state) => ({
      folders,
    })),
}));
