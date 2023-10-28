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
import initSqlJs from "sql.js/dist/sql-asm";
import { useAppColorScheme, useDeviceContext } from "twrnc";
import { Provider as UrqlProvider } from "urql";
import { theme } from "../../tailwind.config";
import { ErrorBoundary } from "./components/errorBoundary/ErrorBoundary";
import { AppContextProvider } from "./context/AppContext";
import useCachedResources from "./hooks/useCachedResources";
import Navigation from "./navigation/Navigation";
import { patchConsoleOutput } from "./utils/patchConsoleOutput/patchConsoleOutput";
import { patchFileReader } from "./utils/patchFileReader/patchFileReader";
import { patchGlobalStyles } from "./utils/patchGlobalStyles/patchGlobalStyles";

patchConsoleOutput();
patchGlobalStyles();
patchFileReader();

const runSql = async () => {
  const SQL = await initSqlJs({
    // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
    // You can omit locateFile completely when running in node
    // locateFile: file => `https://sql.js.org/dist/${file}`
  });

  console.log(SQL);
  const db = new SQL.Database();
  // NOTE: You can also use new SQL.Database(data) where
  // data is an Uint8Array representing an SQLite database file

  // Execute a single SQL string that contains multiple statements
  let sqlstr =
    "CREATE TABLE hello (a int, b char); \
INSERT INTO hello VALUES (0, 'hello'); \
INSERT INTO hello VALUES (1, 'world');";
  db.run(sqlstr); // Run the query without returning anything

  // Prepare an sql statement
  const stmt = db.prepare("SELECT * FROM hello WHERE a=:aval AND b=:bval");

  // Bind values to the parameters and fetch the results of the query
  const result = stmt.getAsObject({ ":aval": 1, ":bval": "world" });
  console.log(result); // Will print {a:1, b:'world'}
  alert(result.b);
};

runSql();

// import { clearDeviceAndSessionStorage } from "./utils/authentication/clearDeviceAndSessionStorage";
// clearDeviceAndSessionStorage();

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
