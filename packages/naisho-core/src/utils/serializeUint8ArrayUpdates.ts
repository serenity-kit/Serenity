import sodium from "react-native-libsodium";

export const serializeUint8ArrayUpdates = (updates: Uint8Array[]) => {
  return JSON.stringify(updates.map((update) => sodium.to_base64(update)));
};
