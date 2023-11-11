import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocalDevice } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { runEncryptedWebDeviceQuery } from "../generated/graphql";

export const webDeviceKeyId = "webDevice.key";
export const webDeviceAccessTokenId = "webDevice.accessToken";

type Params = {
  key: string;
  accessToken: string;
};

let device: LocalDevice | null = null;

export const persistWebDeviceAccess = async ({ key, accessToken }: Params) => {
  AsyncStorage.setItem(webDeviceKeyId, key);
  AsyncStorage.setItem(webDeviceAccessTokenId, accessToken);
};

export const removeWebDeviceAccess = async () => {
  AsyncStorage.removeItem(webDeviceKeyId);
  AsyncStorage.removeItem(webDeviceAccessTokenId);
};

export const getOrFetchWebDevice = async (): Promise<LocalDevice | null> => {
  try {
    if (device) {
      return device;
    }
    const accessToken = await AsyncStorage.getItem(webDeviceAccessTokenId);
    if (!accessToken) return null;
    const result = await runEncryptedWebDeviceQuery({ accessToken });
    if (result.data?.encryptedWebDevice) {
      const { ciphertext, nonce } = result.data.encryptedWebDevice;
      const key = await AsyncStorage.getItem(webDeviceKeyId);
      if (!key) return null;
      const serializedDevice = sodium.crypto_secretbox_open_easy(
        sodium.from_base64(ciphertext),
        sodium.from_base64(nonce),
        sodium.from_base64(key)
      );
      return JSON.parse(sodium.to_string(serializedDevice)) as LocalDevice;
    }
    return null;
  } catch (e) {
    console.warn(e);
    return null;
  }
};
