import { FontAwesome } from "@expo/vector-icons";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { getWebDevice } from "../utils/device/webDeviceStore";
import * as storage from "../utils/storage/storage";

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);
  const [deviceSigningPublicKey, setDeviceSigningPublicKey] = useState<
    null | string
  >(null);

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();

        // Load fonts
        await Font.loadAsync({
          ...FontAwesome.font,
          "space-mono": require("../assets/fonts/SpaceMono-Regular.ttf"),
        });
        const webDevice = await getWebDevice();
        const deviceSigningPublicKey = webDevice?.signingPublicKey;
        // await storage.getItem(
        //   "deviceSigningPublicKey"
        // );
        if (deviceSigningPublicKey) {
          setDeviceSigningPublicKey(deviceSigningPublicKey);
        } else {
          setDeviceSigningPublicKey(null);
        }
        console.log(deviceSigningPublicKey);
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
    deviceSigningPublicKey,
    setDeviceSigningPublicKey,
  };
}
