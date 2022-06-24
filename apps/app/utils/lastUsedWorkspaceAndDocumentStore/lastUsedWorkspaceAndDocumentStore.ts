import { getItem, setItem, removeItem } from "../storage/storage";

export const setLastUsedWorkspaceId = async (workspaceId: string) => {
  try {
    await setItem("lastUsedWorkspaceId", workspaceId);
  } catch (e) {
    // ignore the error
  }
};

export const getLastUsedWorkspaceId = async (): Promise<string | null> => {
  try {
    return await getItem("lastUsedWorkspaceId");
  } catch (e) {
    // error reading value
    return null;
  }
};

export const setLastUsedDocumentId = async (
  documentId: string,
  workspaceId: string
) => {
  try {
    await setItem(`lastUsedDocumentId:${workspaceId}`, documentId);
  } catch (e) {
    // ignore the error
  }
};

export const getLastUsedDocumentId = async (
  workspaceId: string
): Promise<string | null> => {
  try {
    return await getItem(`lastUsedDocumentId:${workspaceId}`);
  } catch (e) {
    // error reading value
    return null;
  }
};

export const removeLastUsedDocumentId = async (workspaceId: string) => {
  try {
    return await removeItem(`lastUsedDocumentId:${workspaceId}`);
  } catch (e) {
    // error reading value
    return null;
  }
};

export const removeLastUsedWorkspaceId = async () => {
  try {
    return await removeItem(`lastUsedWorkspaceId`);
  } catch (e) {
    // error reading value
    return null;
  }
};
