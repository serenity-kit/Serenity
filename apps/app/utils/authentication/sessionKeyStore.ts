import * as storage from "../storage/storage";

export const sessionKeyStorageKey = "sessionKey";

export const setSessionKey = async (sessionKey: string) => {
  await storage.setItem(sessionKeyStorageKey, sessionKey);
};

export const getSessionKey = async (): Promise<string | null> => {
  return storage.getItem(sessionKeyStorageKey);
};

export const deleteSessionKey = async () => {
  return storage.removeItem(sessionKeyStorageKey);
};
