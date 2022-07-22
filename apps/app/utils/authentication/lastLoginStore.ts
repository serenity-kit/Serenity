import { getItem, setItem, removeItem } from "../storage/storage";
import sodium from "@serenity-tools/libsodium";

const lastLoginUsernameSaltKey = "lastLoginUsernameSalt";
const lastLoginHashedUsernameKey = "lastLoginHashedUsername";

type HashUsernameProps = {
  username: string;
  salt: string;
};
const hashUsername = async ({ username, salt }: HashUsernameProps) => {
  const hashedUsername = await sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    username,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );
  console.log({ username, salt });
  return hashedUsername;
};

export const setLoggedInUsername = async (username: string): Promise<void> => {
  const salt = await sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
  await setItem(lastLoginUsernameSaltKey, salt);
  const hashedUsername = await hashUsername({ username, salt });
  await setItem(lastLoginHashedUsernameKey, hashedUsername);
};

export const isUsernameSameAsLastLogin = async (
  username: string
): Promise<boolean> => {
  const salt = await getItem(lastLoginUsernameSaltKey);
  if (!salt) {
    return false;
  }
  const hashedPreviousUsername = await getItem(lastLoginHashedUsernameKey);
  const hashedNewUsername = await hashUsername({ username, salt });
  return hashedNewUsername === hashedPreviousUsername;
};

export const removeLastLogin = async () => {
  await removeItem(lastLoginUsernameSaltKey);
  await removeItem(lastLoginHashedUsernameKey);
};
