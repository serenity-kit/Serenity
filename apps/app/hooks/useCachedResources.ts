import sodium from "@serenity-tools/libsodium";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { Client } from "urql";
import { Device } from "../types/Device";
import * as SessionKeyStore from "../utils/authentication/sessionKeyStore";
import { getSessionKey } from "../utils/authentication/sessionKeyStore";
import { getActiveDevice } from "../utils/device/getActiveDevice";
import { recreateClient } from "../utils/urqlClient/urqlClient";

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);
  const [sessionKey, setSessionKey] = useState<null | string>(null);
  const [activeDevice, setActiveDevice] = useState<null | Device>(null);

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();
        const result = await Promise.all([
          getActiveDevice(),
          sodium.ready,
          // Load fonts
          Font.loadAsync({
            "space-mono": require("../assets/fonts/SpaceMono-Regular.ttf"),
          }),
        ]);
        setActiveDevice(result[0]);
        const sessionKey = await getSessionKey();
        setSessionKey(sessionKey);
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  const updateAuthentication = useCallback(
    async (
      session: { sessionKey: string; expiresAt: string } | null
    ): Promise<Client> => {
      if (session) {
        setSessionKey(session.sessionKey);
        await SessionKeyStore.setSessionKey(session.sessionKey);
      } else {
        setSessionKey(null);
        await SessionKeyStore.deleteSessionKey();
      }
      const urqlClient = recreateClient();
      return urqlClient;
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
  };
}
