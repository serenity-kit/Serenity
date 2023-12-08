import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Button,
  Heading,
  ScrollSafeAreaView,
  SidebarLink,
  Text,
  View,
  tw,
} from "@serenity-tools/ui";
import { useWindowDimensions } from "react-native";
import { RootStackScreenProps } from "../../../types/navigationProps";
import { getEnvironmentUrls } from "../../../utils/getEnvironmentUrls/getEnvironmentUrls";
import { getOpaqueServerPublicKey } from "../../../utils/getOpaqueServerPublicKey/getOpaqueServerPublicKey";

export default function DevDashboardScreen(
  props: RootStackScreenProps<"DevDashboard">
) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const { frontendOrigin, graphqlEndpoint, websocketOrigin } =
    getEnvironmentUrls();

  return (
    <ScrollSafeAreaView style={tw`py-6 px-6`}>
      <View style={tw`my-4`}>
        <Heading lvl={2}>URLs</Heading>
      </View>
      <View>
        <Text variant="sm">Frontend Origin: {frontendOrigin}</Text>
      </View>
      <View>
        <Text variant="sm">Server Endpoint: {graphqlEndpoint}</Text>
      </View>
      <View>
        <Text variant="sm">Websocket Endpoint: {websocketOrigin}</Text>
      </View>
      <View>
        <Text variant="sm">
          Opaque Public Key: {getOpaqueServerPublicKey()}
        </Text>
      </View>
      <View style={tw`my-4`}>
        <Heading lvl={2}>Links</Heading>
      </View>
      <SidebarLink to={{ screen: "Root" }} iconName="dashboard-line">
        Home
      </SidebarLink>
      <SidebarLink to={{ screen: "DesignSystem" }} iconName="book-open-line">
        Design System
      </SidebarLink>
      {/* <SidebarLink to={{ screen: "UITest" }} iconName="dashboard-line">
        UI Testing Area
      </SidebarLink>
      <SidebarLink to={{ screen: "TestLibsodium" }} iconName="dashboard-line">
        Libsodium Test Screen
      </SidebarLink>
      <SidebarLink
        to={{ screen: "EncryptDecryptImageTest" }}
        iconName="dashboard-line"
      >
        Encrypt / Decrypt Image
      </SidebarLink> */}
      <View style={tw`my-4`}>
        <Heading lvl={2}>Debugging Tools</Heading>
      </View>
      <Button
        onPress={async () => {
          const sqliteDebugger = await AsyncStorage.getItem("sqlite_debugger");
          if (sqliteDebugger === "active") {
            await AsyncStorage.removeItem("sqlite_debugger");
          } else {
            await AsyncStorage.setItem("sqlite_debugger", "active");
          }
        }}
      >
        Toggle Sqlite Debugger (manual refresh needed)
      </Button>
    </ScrollSafeAreaView>
  );
}
