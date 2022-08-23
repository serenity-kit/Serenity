import * as storage from "../storage/storage";

export const exportKeyStorageKey = "exportKey";

export const setExportKey = async (exportKey: string) => {
  await storage.setItem(exportKeyStorageKey, exportKey);
};

export const getExportKey = async (): Promise<string | null> => {
  return storage.getItem(exportKeyStorageKey);
};

export const deleteExportKey = async () => {
  return storage.removeItem(exportKeyStorageKey);
};
