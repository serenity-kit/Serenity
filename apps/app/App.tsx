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
  cacheExchange,
} from "urql";
import { NativeBaseProvider } from "native-base";
import { authExchange } from "@urql/exchange-auth";

type AuthState = {
  deviceSigningPublicKey: string;
};

const client = createClient({
  url:
    process.env.NODE_ENV === "development"
      ? "http://localhost:4000/graphql"
      : "https://serenity-staging-api.herokuapp.com/graphql",
  requestPolicy: "cache-and-network",
  exchanges: [
    dedupExchange,
    cacheExchange,
    authExchange<AuthState>({
      getAuth: async ({ authState }) => {
        if (!authState) {
          const deviceSigningPublicKey = localStorage.getItem(
            "deviceSigningPublicKey"
          );

          if (deviceSigningPublicKey) {
            return { deviceSigningPublicKey };
          }
          return null;
        }

        return null;
      },
      addAuthToOperation: ({ authState, operation }) => {
        if (!authState || !authState.deviceSigningPublicKey) {
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
              Authorization: authState.deviceSigningPublicKey,
            },
          },
        });
      },
    }),
    fetchExchange,
  ],
});

export default function App() {
  const isLoadingComplete = useCachedResources();
  useDeviceContext(tw);
  const [colorScheme] = useAppColorScheme(tw);

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <Provider value={client}>
        <SafeAreaProvider>
          <NativeBaseProvider>
            <Navigation colorScheme={colorScheme} />
            <StatusBar />
          </NativeBaseProvider>
        </SafeAreaProvider>
      </Provider>
    );
  }
}
