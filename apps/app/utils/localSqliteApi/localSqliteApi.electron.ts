import type { Document } from "./types";

export interface SerenityElectron {
  setDocument: (document: Document) => Promise<boolean>;
  getDocument: (documentId: string) => Promise<Document>;
}

declare global {
  interface Window {
    serenityElectron: SerenityElectron;
  }
}

export const setLocalDocument = async (document: Document) => {
  return await window.serenityElectron.setDocument(document);
};

export const getLocalDocument = async (
  documentId: string
): Promise<Document | undefined> => {
  return await window.serenityElectron.getDocument(documentId);
};
