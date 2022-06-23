import AsyncStorage from "@react-native-async-storage/async-storage";

export const setLastUsedWorkspaceId = async (workspaceId: string) => {
  try {
    await AsyncStorage.setItem("lastUsedWorkspaceId", workspaceId);
  } catch (e) {
    // ignore the error
  }
};

export const getLastUsedWorkspaceId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("lastUsedWorkspaceId");
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
    await AsyncStorage.setItem(`lastUsedDocumentId:${workspaceId}`, documentId);
  } catch (e) {
    // ignore the error
  }
};

export const getLastUsedDocumentId = async (
  workspaceId: string
): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(`lastUsedDocumentId:${workspaceId}`);
  } catch (e) {
    // error reading value
    return null;
  }
};
