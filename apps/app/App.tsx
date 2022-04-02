import "expo-dev-client";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import useCachedResources from "./hooks/useCachedResources";
import { tw } from "@serenity-tools/ui";
import Navigation from "./navigation";
import { useDeviceContext, useAppColorScheme } from "twrnc";

export default function App() {
  const isLoadingComplete = useCachedResources();
  useDeviceContext(tw);
  const [colorScheme] = useAppColorScheme(tw);

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}
