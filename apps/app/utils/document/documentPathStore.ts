import { Client } from "urql";
import create from "zustand";
import {
  DocumentPathDocument,
  DocumentPathQuery,
  DocumentPathQueryVariables,
  Folder,
} from "../../generated/graphql";

interface DocumentPathState {
  folders: Folder[];
  folderIds: string[];
  update: (folders: Folder[]) => void;
}

export const useDocumentPathStore = create<DocumentPathState>((set) => ({
  folders: [],
  folderIds: [],
  update: (folders) => {
    const folderIds: string[] = [];
    folders.forEach((folder: Folder) => {
      folderIds.push(folder.id);
    });
    set((state) => ({
      folders,
      folderIds,
    }));
  },
}));

export const getDocumentPath = async (
  urqlClient: Client,
  documentId: string
): Promise<Folder[]> => {
  const documentPathResult = await urqlClient
    .query<DocumentPathQuery, DocumentPathQueryVariables>(
      DocumentPathDocument,
      { id: documentId },
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  const documentPath = documentPathResult.data?.documentPath as Folder[];
  const documentPathStore = useDocumentPathStore();
  documentPathStore.update(documentPath);
  return documentPath;
};
