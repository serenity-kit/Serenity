import "expo-dev-client";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import useCachedResources from "./hooks/useCachedResources";
import { tw } from "@serenity-tools/ui";
import Navigation from "./navigation";
import { useDeviceContext, useAppColorScheme } from "twrnc";
import { createClient, Provider } from "urql";
import { NativeBaseProvider } from "native-base";

const client = createClient({
  url:
    process.env.NODE_ENV === "development"
      ? "http://localhost:4000/graphql"
      : "https://serenity-staging-api.herokuapp.com/graphql",
  requestPolicy: "cache-and-network",
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
