import * as storage from "../storage/storage";

export const sessionKeyStorageKey = "sessionKey";
let quickAccessSessionKey: string | null = null;

export const setSessionKey = async (sessionKey: string) => {
  console.log(`setting session key to: ${sessionKey}`);
  quickAccessSessionKey = sessionKey;
  await storage.setItem(sessionKeyStorageKey, sessionKey);
};

export const getSessionKey = async (): Promise<string | null> => {
  const sessionKey = await storage.getItem(sessionKeyStorageKey);
  console.log(`getting session key: ${sessionKey}`);
  return sessionKey;
};

export const quickGetSessionKey = (): string | null => {
  console.log(`quickly getting session key: ${quickAccessSessionKey}`);
  return quickAccessSessionKey;
};

export const deleteSessionKey = async () => {
  console.log(`deleting session key`);
  quickAccessSessionKey = null;
  return storage.removeItem(sessionKeyStorageKey);
};
