import "expo-dev-client";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import useCachedResources from "./hooks/useCachedResources";
import { tw } from "@serenity-tools/ui";
import Navigation from "./navigation/Navigation";
import { useDeviceContext, useAppColorScheme } from "twrnc";
import {
  createClient,
  makeOperation,
  Provider,
  fetchExchange,
  dedupExchange,
} from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { NativeBaseProvider, extendTheme } from "native-base";
import { authExchange } from "@urql/exchange-auth";
import {
  useFonts,
  // Inter options can be found here https://github.com/expo/google-fonts/tree/master/font-packages/inter
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { AuthenticationProvider } from "./context/AuthenticationContext";
import { useCallback, useEffect, useMemo } from "react";
import { devtoolsExchange } from "@urql/devtools";
import { theme } from "../../tailwind.config";
import { OpaqueBridge } from "@serenity-tools/opaque";
import { RootSiblingParent } from "react-native-root-siblings";
import { getWebDevice } from "./utils/device/webDeviceStore";
import Constants from "expo-constants";
import {
  deleteSessionKey,
  getSessionKey,
} from "./utils/authentication/sessionKeyStore";
import { source } from "./webviews/opaque/source";

// import { clearLocalSessionData } from "./utils/authentication/clearLocalSessionData";
// clearLocalSessionData();

type AuthState = {
  sessionKey: string;
};

const unauthenticatedOperation = [
  "startRegistration",
  "finishRegistration",
  "startLogin",
  "finishLogin",
];

const exchanges = [
  dedupExchange,
  cacheExchange({
    keys: {
      WorkspaceMember: () => null, // since it has no unique key
      // @ts-expect-error the type seems to be wrong
      MainDeviceResult: (mainDevice) => {
        return mainDevice.signingPublicKey;
      },
      // @ts-expect-error the type seems to be wrong
      Device: (device) => {
        return device.signingPublicKey;
      },
    },
  }),
  authExchange<AuthState>({
    // if it fails it will run getAuth again and see if the client already logged in in the meantime
    willAuthError: ({ operation, authState }) => {
      if (!authState) {
        // detect the unauthenticated mutations and let this operations through
        return !(
          operation.kind === "mutation" &&
          operation.query.definitions.some((definition) => {
            return (
              definition.kind === "OperationDefinition" &&
              definition.selectionSet.selections.some((node) => {
                return (
                  node.kind === "Field" &&
                  unauthenticatedOperation.includes(node.name.value)
                );
              })
            );
          })
        );
      }

      return false;
    },
    getAuth: async ({ authState }) => {
      if (!authState) {
        // check for login
        try {
          const sessionKey = await getSessionKey();
          if (sessionKey) {
            return { sessionKey };
          }
        } catch (err) {
          // TODO: explain why fetching the sessionKey failed
          console.error(err);
        }
      }
      return null;
    },
    addAuthToOperation: ({ authState, operation }) => {
      if (!authState || !authState.sessionKey) {
        return operation;
      }

      const fetchOptions =
        typeof operation.context.fetchOptions === "function"
          ? operation.context.fetchOptions()
          : operation.context.fetchOptions || {};

      return makeOperation(operation.kind, operation, {
        ...operation.context,
        fetchOptions: {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            Authorization: authState.sessionKey,
          },
        },
      });
    },
  }),
  fetchExchange,
];

export default function App() {
  const { isLoadingComplete, sessionKey, setSessionKey } = useCachedResources();

  const updateAuthentication = useCallback(
    async (session: { sessionKey: string; expiresAt: string } | null) => {
      if (session) {
        setSessionKey(session.sessionKey);
        await setSessionKey(session.sessionKey);
      } else {
        setSessionKey(null);
        await deleteSessionKey();
      }
    },
    [setSessionKey]
  );

  const checkForWebDevice = async () => {
    const webDevice = await getWebDevice();
    console.log({ webDevice });
  };

  useEffect(() => {
    (async () => {
      await checkForWebDevice();
    })();
  }, []);

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
  });

  // recreate client and especially the internal cache every time the authentication state changes
  const client = useMemo(() => {
    return createClient({
      url: Constants.manifest?.extra?.apiUrl,
      requestPolicy: "cache-and-network",
      exchanges:
        process.env.NODE_ENV === "development"
          ? [devtoolsExchange, ...exchanges]
          : exchanges,
    });
  }, [sessionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoadingComplete || !isFontLoadingComplete) {
    return null;
  } else {
    return (
      <RootSiblingParent>
        <AuthenticationProvider
          value={{
            updateAuthentication,
            sessionKey,
          }}
        >
          <Provider value={client}>
            <SafeAreaProvider>
              <NativeBaseProvider theme={rnTheme}>
                <Navigation colorScheme={colorScheme} />
                <StatusBar />
                <OpaqueBridge source={source} />
              </NativeBaseProvider>
            </SafeAreaProvider>
          </Provider>
        </AuthenticationProvider>
      </RootSiblingParent>
    );
  }
}
