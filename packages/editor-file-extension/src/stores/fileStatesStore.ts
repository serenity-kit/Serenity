import create from "zustand";
import { FileState } from "../types";

interface FileStatesStore {
  fileStates: {
    [fileId: string]: FileState;
  };
  updateFileState: (fileId: string, fileState: FileState) => void;
}

export const useFileStatesStore = create<FileStatesStore>((set) => ({
  fileStates: {},
  updateFileState: (fileId, fileState) => {
    set((state) => ({
      fileStates: {
        ...state.fileStates,
        [fileId]: fileState,
      },
    }));
  },
}));
