import React, { useContext } from "react";
import { Device } from "../types/Device";

export type UpdateAuthenticationFunction = (
  params: { sessionKey: string; expiresAt: string } | null
) => Promise<void>;

export type AppContext = {
  sessionKey: string | null;
  updateAuthentication: UpdateAuthenticationFunction;
  updateActiveDevice: () => Promise<void>;
  activeDevice: Device | null;
};

const appContext = React.createContext<AppContext>({
  sessionKey: null,
  updateAuthentication: async () => undefined,
  updateActiveDevice: async () => undefined,
  activeDevice: null,
});

export const AppContextProvider = appContext.Provider;

export const useAppContext = () => {
  return useContext(appContext);
};
