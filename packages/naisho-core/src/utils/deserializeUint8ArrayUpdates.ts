import sodium from "react-native-libsodium";

export const deserializeUint8ArrayUpdates = (
  serialized: string
): Uint8Array[] => {
  const parsed = JSON.parse(serialized);
  return parsed.map((update: string) => sodium.from_base64(update));
};
