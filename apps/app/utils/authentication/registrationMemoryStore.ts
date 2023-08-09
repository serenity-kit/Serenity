import * as userChain from "@serenity-kit/user-chain";

type RegistrationInfo = {
  username: string;
  password: string;
  createChainEvent: userChain.CreateChainEvent;
};

let storedRegistrationInfo: RegistrationInfo | null = null;

export const setRegistrationInfo = (registrationInfo: RegistrationInfo) => {
  storedRegistrationInfo = registrationInfo;
};

export const isRegistrationInfoStored = (): boolean => {
  return storedRegistrationInfo !== null;
};

export const getRegistrationInfo = (): RegistrationInfo | null => {
  return storedRegistrationInfo;
};

export const clearRegistrationInfo = async () => {
  storedRegistrationInfo = null;
};
