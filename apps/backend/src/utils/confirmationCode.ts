import * as sodium from "@serenity-tools/libsodium";

export const createConfirmationCode = async (): Promise<string> => {
  const length = 8;
  const confirmationCode: number[] = new Array(length);
  for (let i = 0; i < length; i++) {
    confirmationCode[i] = await sodium.randombytes_uniform(10);
  }
  return confirmationCode.join("");
};
