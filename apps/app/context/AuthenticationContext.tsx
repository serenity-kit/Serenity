import React, { useContext } from "react";

export type AuthenticationContext = {
  deviceSigningPublicKey: string | null;
  updateAuthentication: (params: string | null) => void;
};

const authenticationContext = React.createContext<AuthenticationContext>({
  deviceSigningPublicKey: null,
  updateAuthentication: () => undefined,
});

export const AuthenticationProvider = authenticationContext.Provider;

export const useAuthentication = () => {
  return useContext(authenticationContext);
};
