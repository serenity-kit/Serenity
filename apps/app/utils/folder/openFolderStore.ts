import create from "zustand";

interface OpenFolderState {
  folderIds: string[];
  update: (folderIds: string[]) => void;
}

export const useOpenFolderStore = create<OpenFolderState>((set) => ({
  folderIds: [],
  update: (folderIds) => {
    console.log({ folderIds });
    set(() => ({
      folderIds,
    }));
  },
}));
