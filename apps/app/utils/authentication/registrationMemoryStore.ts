let storedUsername: string | null = null;
let storedPassword: string | null = null;

export const storeUsernamePassword = (username: string, password: string) => {
  storedUsername = username;
  storedPassword = password;
};

export const isUsernamePasswordStored = (): boolean => {
  return storedUsername !== null || storedPassword !== null;
};

export const getStoredUsername = (): string | null => {
  return storedUsername;
};

export const getStoredPassword = (): string | null => {
  return storedPassword;
};

export const deleteStoredUsernamePassword = async () => {
  storedUsername = null;
  storedPassword = null;
};
