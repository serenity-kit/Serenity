import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { getExportKey } from "../utils/authentication/exportKeyStore";
import { getSessionKey } from "../utils/authentication/sessionKeyStore";

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);
  const [sessionKey, setSessionKey] = useState<null | string>(null);
  const [exportKey, setExportKey] = useState<null | string>(null);

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();
        // Load fonts
        await Font.loadAsync({
          "space-mono": require("../assets/fonts/SpaceMono-Regular.ttf"),
        });
        const sessionKey = await getSessionKey();
        setSessionKey(sessionKey);
        const exportKey = await getExportKey();
        setExportKey(exportKey);
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
    exportKey,
    setSessionKey,
    setExportKey,
  };
}
