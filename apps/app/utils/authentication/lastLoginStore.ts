import { getItem, setItem, removeItem } from "../storage/storage";
import * as crypto from "expo-crypto";

const lastLoginHashedUsernameKey = "lastLoginHashedUsername";

const hashUserId = async (userId: string) => {
  const hashedUserId = await crypto.digestStringAsync(
    crypto.CryptoDigestAlgorithm.SHA256,
    userId
  );
  return hashedUserId;
};

export const setLoggedInUserId = async (userId: string): Promise<void> => {
  const hashedUserId = await hashUserId(userId);
  await setItem(lastLoginHashedUsernameKey, hashedUserId);
};

export const isUserIdSameAsLastLogin = async (
  userId: string
): Promise<boolean> => {
  const hashedPreviousUserId = await getItem(lastLoginHashedUsernameKey);
  const hashedNewUserId = await hashUserId(userId);
  await setLoggedInUserId(userId);
  return hashedNewUserId === hashedPreviousUserId;
};

export const removeLastLogin = async () => {
  await removeItem(lastLoginHashedUsernameKey);
};
