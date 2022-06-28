import React, { useContext } from "react";

export type UpdateAuthenticationFunction = (
  params: { sessionKey: string; expiresAt: string } | null
) => Promise<void>;

export type AuthenticationContext = {
  sessionKey: string | null;
  updateAuthentication: UpdateAuthenticationFunction;
};

const authenticationContext = React.createContext<AuthenticationContext>({
  sessionKey: null,
  updateAuthentication: async () => undefined,
});

export const AuthenticationProvider = authenticationContext.Provider;

export const useAuthentication = () => {
  return useContext(authenticationContext);
};
