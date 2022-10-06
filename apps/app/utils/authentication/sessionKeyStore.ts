import * as storage from "../storage/storage";

export const sessionKeyStorageKey = "sessionKey";

export const setSessionKey = async (sessionKey: string) => {
  await storage.setItem(sessionKeyStorageKey, sessionKey);
};

export const getSessionKey = async (): Promise<string | null> => {
  const sessionKey = await storage.getItem(sessionKeyStorageKey);
  return sessionKey;
};

export const deleteSessionKey = async () => {
  return storage.removeItem(sessionKeyStorageKey);
};
