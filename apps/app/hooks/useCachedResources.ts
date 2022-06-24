import { FontAwesome } from "@expo/vector-icons";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { getMainDevice } from "../utils/device/mainDeviceMemoryStore";
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
        try {
          const webDevice = await getWebDevice();
          if (webDevice) {
            const deviceSigningPublicKey = webDevice.signingPublicKey;
            setDeviceSigningPublicKey(deviceSigningPublicKey);
          } else {
            const mainDevice = getMainDevice();
            if (mainDevice) {
              const deviceSigningPublicKey = mainDevice?.signingPublicKey;
              setDeviceSigningPublicKey(deviceSigningPublicKey);
            } else {
              const mainDeviceSigningPublicKey = await storage.getItem(
                "mainDeviceSigningPublicKey"
              );
              if (mainDeviceSigningPublicKey) {
                return { deviceSigningPublicKey: mainDeviceSigningPublicKey };
              }
            }
          }
        } catch (err) {
          // TODO: explain why fetching the webdevice failed
          console.error(err);
        }
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
