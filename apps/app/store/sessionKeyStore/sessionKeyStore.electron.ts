import * as electronInterface from "../../utils/setupElectronInterface/setupElectronInterface.electron";

export const setSessionKey = async (sessionKey: string) => {
  return electronInterface.setSessionKey(sessionKey);
};

export const getSessionKey = async (): Promise<string | null> => {
  return electronInterface.getSessionKey();
};

export const deleteSessionKey = async () => {
  return electronInterface.deleteSessionKey();
};
