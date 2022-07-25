import { getItem, setItem, removeItem } from "../storage/storage";
import * as crypto from "expo-crypto";

const lastLoginHashedUsernameKey = "lastLoginHashedUsername";

const hashUsername = async (username: string) => {
  const hashedUsername = await crypto.digestStringAsync(
    crypto.CryptoDigestAlgorithm.SHA256,
    username
  );
  return hashedUsername;
};

export const setLoggedInUsername = async (username: string): Promise<void> => {
  const hashedUsername = await hashUsername(username);
  await setItem(lastLoginHashedUsernameKey, hashedUsername);
};

export const isUsernameSameAsLastLogin = async (
  username: string
): Promise<boolean> => {
  const hashedPreviousUsername = await getItem(lastLoginHashedUsernameKey);
  const hashedNewUsername = await hashUsername(username);
  await setLoggedInUsername(username);
  return hashedNewUsername === hashedPreviousUsername;
};

export const removeLastLogin = async () => {
  await removeItem(lastLoginHashedUsernameKey);
};
