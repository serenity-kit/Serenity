import * as electronInterface from "../../utils/setupElectronInterface/electronInterface.electron";

export const setSessionKey = async (sessionKey: string) => {
  return electronInterface.setSessionKey(sessionKey);
};

export const getSessionKey = async (): Promise<string | null> => {
  const sessionKey = await electronInterface.getSessionKey();
  return sessionKey;
};

export const deleteSessionKey = async () => {
  return electronInterface.deleteSessionKey();
};
