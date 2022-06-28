import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { getMainDevice } from "../utils/device/mainDeviceMemoryStore";
import { getWebDevice } from "../utils/device/webDeviceStore";
import * as storage from "../utils/storage/storage";

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);
  const [sessionKey, setSessionKey] = useState<null | string>(null);

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();

        // Load fonts
        await Font.loadAsync({
          "space-mono": require("../assets/fonts/SpaceMono-Regular.ttf"),
        });
        const sessionKey = await storage.getItem("sessionKey");
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

  return {
    isLoadingComplete,
    sessionKey,
    setSessionKey,
  };
}
