import { LocalDevice } from "@serenity-tools/common";
import React, { useContext } from "react";
import { Client } from "urql";
import { getUrqlClient } from "../utils/urqlClient/urqlClient";

export type UpdateAuthenticationFunction = (
  params: { sessionKey: string; expiresAt: string } | null
) => Promise<Client>;

export type AppContext = {
  sessionKey: string | null;
  updateAuthentication: UpdateAuthenticationFunction;
  updateActiveDevice: () => Promise<void>;
  activeDevice: LocalDevice | null;
};

const appContext = React.createContext<AppContext>({
  sessionKey: null,
  updateAuthentication: async () => getUrqlClient(),
  updateActiveDevice: async () => undefined,
  activeDevice: null,
});

export const AppContextProvider = appContext.Provider;

export const useAppContext = () => {
  return useContext(appContext);
};
