import { LocalDevice } from "@serenity-tools/common";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import sodium from "react-native-libsodium";
import { Client } from "urql";
import { createSqlTables } from "../store/createSqlTables";
import * as SessionKeyStore from "../store/sessionKeyStore/sessionKeyStore";
import { getSessionKey } from "../store/sessionKeyStore/sessionKeyStore";
import { getActiveDevice } from "../utils/device/getActiveDevice";
import {
  isElectron,
  isSafeStorageAvailable,
} from "../utils/setupElectronInterface/electronInterface";
import { getUrqlClient, recreateClient } from "../utils/urqlClient/urqlClient";

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);
  const [sessionKey, setSessionKey] = useState<null | string>(null);
  const [activeDevice, setActiveDevice] = useState<null | LocalDevice>(null);
  const [urqlClient, setUrqlClient] = useState<Client>(getUrqlClient());

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      let isElectronAndHasNoSafeStorage = false;

      try {
        SplashScreen.preventAutoHideAsync();
        await sodium.ready; // sodium must be ready before we load any devices or similar

        const result = await Promise.all([
          getActiveDevice(),
          // Load fonts
          Font.loadAsync({
            "space-mono": require("../assets/fonts/SpaceMono-Regular.ttf"),
          }),
          createSqlTables(),
          isSafeStorageAvailable(),
        ]);
        setActiveDevice(result[0]);

        if (isElectron() && !result[3]) {
          isElectronAndHasNoSafeStorage = true;
        }

        const sessionKey = await getSessionKey();
        setSessionKey(sessionKey);
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        if (!isElectronAndHasNoSafeStorage) {
          setLoadingComplete(true);
          SplashScreen.hideAsync();
        } else {
          alert(
            "Encrypted storage is not available on your operating system.\n\nPlease contact support or try a different OS."
          );
        }
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  const updateAuthentication = useCallback(
    async (
      session: { sessionKey: string; expiresAt: string } | null
    ): Promise<Client> => {
      if (session) {
        await SessionKeyStore.setSessionKey(session.sessionKey);
        setSessionKey(session.sessionKey);
      } else {
        await SessionKeyStore.deleteSessionKey();
        setSessionKey(null);
      }
      const newUrqlClient = recreateClient(); // the sessionKey
      setUrqlClient(newUrqlClient);
      return newUrqlClient;
    },
    [setSessionKey]
  );

  const updateActiveDevice = useCallback(async () => {
    const device = await getActiveDevice();
    setActiveDevice(device);
  }, [setActiveDevice]);

  return {
    isLoadingComplete,
    sessionKey,
    activeDevice,
    setActiveDevice,
    updateActiveDevice,
    updateAuthentication,
    urqlClient,
  };
}
