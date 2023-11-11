import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter"; // Inter options can be found here https://github.com/expo/google-fonts/tree/master/font-packages/inter
import {
  tw,
  useIsDesktopDevice,
  useIsEqualOrLargerThanBreakpoint,
} from "@serenity-tools/ui";
import "expo-dev-client";
import { StatusBar } from "expo-status-bar";
import { NativeBaseProvider, extendTheme } from "native-base";
import { OverlayProvider } from "react-native-popper";
import { RootSiblingParent } from "react-native-root-siblings";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppColorScheme, useDeviceContext } from "twrnc";
import { Provider as UrqlProvider } from "urql";
import { theme } from "../../tailwind.config";
import { ErrorBoundary } from "./components/errorBoundary/ErrorBoundary";
import { AppContextProvider } from "./context/AppContext";
import useCachedResources from "./hooks/useCachedResources";
import Navigation from "./navigation/Navigation";
import { SqliteDebugger } from "./store/sql/SqliteDebugger";
import { patchConsoleOutput } from "./utils/patchConsoleOutput/patchConsoleOutput";
import { patchFileReader } from "./utils/patchFileReader/patchFileReader";
import { patchGlobalStyles } from "./utils/patchGlobalStyles/patchGlobalStyles";
import "./utils/setupElectronInterface/setupElectronInterface";

patchConsoleOutput();
patchGlobalStyles();
patchFileReader();

// import { clearDeviceAndSessionStores } from "./utils/authentication/clearDeviceAndSessionStores";
// clearDeviceAndSessionStores();

export default function App() {
  const {
    isLoadingComplete,
    sessionKey,
    updateAuthentication,
    activeDevice,
    updateActiveDevice,
    urqlClient,
  } = useCachedResources();
  const isDesktopDevice = useIsDesktopDevice();
  const isEqualOrLargerThanXS = useIsEqualOrLargerThanBreakpoint("xs");

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
      // these Input settings are extracted from their component as native-base also uses it
      // internally for their Select component (which we also use), so all shared stylings
      // - for Input and Input within the Select component - need to be defined here
      Input: {
        baseStyle: {
          padding: 4,
          display: "flex",
          justifyContent: "center",
          color: tw.color("gray-900"),
          fontFamily: "Inter_400Regular",
          _disabled: {
            opacity: 0.5,
            color: tw.color("gray-600"),
            _stack: {
              backgroundColor: tw.color("gray-100"),
            },
          },
          _stack: {
            height: isEqualOrLargerThanXS ? 10 : 12,
            backgroundColor: "white",
            style: [tw`border-gray-400`],
          },
          _hover: {
            _stack: {
              style: [tw`border-gray-600`],
            },
            _disabled: {
              _stack: {
                style: [tw`border-gray-400`],
              },
            },
          },
          _focus: {
            _stack: {
              // background needs to be set here (nb-override)
              style: [tw`bg-white border-primary-400 se-outline-focus-input`],
            },
            _hover: {
              _stack: {
                style: [tw`border-primary-400 se-outline-focus-input`],
              },
            },
          },
          _invalid: {
            _stack: {
              style: [tw`border-error-500`],
            },
            _hover: {
              _stack: {
                style: [tw`border-error-500`],
              },
            },
            _focus: {
              _stack: {
                style: [tw`border-error-500 se-outline-error-input`],
              },
              _hover: {
                _stack: {
                  style: [tw`border-error-500 se-outline-error-input`],
                },
              },
            },
          },
        },
      },
    },
  });

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
                  <OverlayProvider>
                    <Navigation colorScheme={colorScheme} />
                    <StatusBar />
                    <SqliteDebugger />
                  </OverlayProvider>
                </NativeBaseProvider>
              </SafeAreaProvider>
            </UrqlProvider>
          </AppContextProvider>
        </RootSiblingParent>
      </ErrorBoundary>
    );
  }
}
