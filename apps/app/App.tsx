import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter"; // Inter options can be found here https://github.com/expo/google-fonts/tree/master/font-packages/inter
import { OpaqueBridge } from "@serenity-tools/opaque";
import { tw, useIsDesktopDevice } from "@serenity-tools/ui";
import "expo-dev-client";
import { StatusBar } from "expo-status-bar";
import { extendTheme, NativeBaseProvider } from "native-base";
import { useMemo } from "react";
import { RootSiblingParent } from "react-native-root-siblings";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppColorScheme, useDeviceContext } from "twrnc";
import { Provider as UrqlProvider } from "urql";
import { theme } from "../../tailwind.config";
import { ErrorBoundary } from "./components/errorBoundary/ErrorBoundary";
import { AppContextProvider } from "./context/AppContext";
import useCachedResources from "./hooks/useCachedResources";
import Navigation from "./navigation/Navigation";
import { getSessionKey } from "./utils/authentication/sessionKeyStore";
import { patchConsoleOutput } from "./utils/patchConsoleOutput/patchConsoleOutput";
import { recreateClient } from "./utils/urqlClient/urqlClient";
import { source } from "./webviews/opaque/source";

patchConsoleOutput();

// import { clearDeviceAndSessionStorage } from "./utils/authentication/clearDeviceAndSessionStorage";
// clearDeviceAndSessionStorage();

export default function App() {
  const {
    isLoadingComplete,
    sessionKey,
    updateAuthentication,
    activeDevice,
    updateActiveDevice,
  } = useCachedResources();
  const isDesktopDevice = useIsDesktopDevice();

  const [isFontLoadingComplete] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // 1️opt out of listening to device color scheme events until we support dark mode
  useDeviceContext(tw, { withDeviceColorScheme: false });

  // hard-coding the colorScheme to light until we support dark mode
  const [colorScheme] = useAppColorScheme(tw, "light");
  const rnTheme = extendTheme({
    colors: {
      ...theme.colors,
    },
    fontSizes: {
      "3xs": 8,
    },
    components: {
      Avatar: {
        sizes: {
          xxs: {
            width: isDesktopDevice ? 4 : 5,
            height: isDesktopDevice ? 4 : 5,
            _text: {
              fontSize: "3xs",
            },
            _badgeSize: 2,
          },
        },
      },
    },
  });

  // recreate client and especially the internal cache every time the authentication state changes
  const urqlClient = useMemo(() => {
    console.log("sessionKey changed, recreating client");
    console.log(`at the time of recreation, the session key is: ${sessionKey}`);
    getSessionKey().then((sessionKey) => {
      console.log(
        `at the time of recreation, the session key is: ${sessionKey}`
      );
    });
    return recreateClient();
  }, [sessionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoadingComplete || !isFontLoadingComplete) {
    return null;
  } else {
    return (
      <ErrorBoundary>
        <RootSiblingParent>
          <AppContextProvider
            value={{
              updateAuthentication,
              updateActiveDevice,
              sessionKey,
              activeDevice,
            }}
          >
            <UrqlProvider value={urqlClient}>
              <SafeAreaProvider>
                <NativeBaseProvider theme={rnTheme}>
                  <Navigation colorScheme={colorScheme} />
                  <StatusBar />
                  <OpaqueBridge source={source} />
                </NativeBaseProvider>
              </SafeAreaProvider>
            </UrqlProvider>
          </AppContextProvider>
        </RootSiblingParent>
      </ErrorBoundary>
    );
  }
}
