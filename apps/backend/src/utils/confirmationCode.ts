import { randombytes_uniform } from "react-native-libsodium";

export const createConfirmationCode = (): string => {
  const length = 8;
  const confirmationCode: number[] = new Array(length);
  for (let i = 0; i < length; i++) {
    confirmationCode[i] = randombytes_uniform(10);
  }
  return confirmationCode.join("");
};
