import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { ColorSchemeName, StyleSheet, useWindowDimensions } from "react-native";
import { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";

import NotFoundScreen from "./screens/NotFoundScreen";
import EditorScreen from "./screens/EditorScreen";
import { RootStackParamList } from "../types";
import DashboardScreen from "./screens/DashboardScreen";
import DevDashboardScreen from "./screens/DevDashboardScreen";
import PageScreen from "./screens/PageScreen";
import LibsodiumTestScreen from "./screens/LibsodiumTestScreen";
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import WorkspaceSettingsScreen from "./screens/WorkspaceSettingsScreen";
import DesignSystemScreen from "./screens/DesignSystemScreen";
import Sidebar from "../components/sidebar/Sidebar";
import EncryptDecryptImageTestScreen from "./screens/EncryptDecryptImageTestScreen";
import {
  Icon,
  Pressable,
  Text,
  tw,
  useIsPermanentLeftSidebar,
} from "@serenity-tools/ui";
import RootScreen from "./screens/RootScreen";
import NoWorkspaceScreen from "./screens/NoWorkspaceScreen";
import { DrawerActions } from "@react-navigation/native";

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

const styles = StyleSheet.create({
  header: tw`bg-white dark:bg-gray-900 border-b border-gray-200 h-top-bar shadow-opacity-0`,
});

function WorkspaceStackScreen(props) {
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();
  const { width } = useWindowDimensions();

  if (!props.route.params) {
    return null;
  }

  return (
    <Drawer.Navigator
      drawerContent={(props) => <Sidebar {...props} />}
      screenOptions={{
        headerShown: true,
        headerTitle: (props) => <Text>{props.children}</Text>,
        headerStyle: styles.header,
        drawerType: isPermanentLeftSidebar ? "permanent" : "front",
        drawerStyle: {
          width: isPermanentLeftSidebar ? 240 : width,
        },
        headerLeft: isPermanentLeftSidebar
          ? () => null
          : () => {
              return (
                <Pressable
                  style={tw`pl-6`}
                  onPress={() => {
                    props.navigation.dispatch(DrawerActions.openDrawer());
                  }}
                >
                  <Icon name="menu" />
                </Pressable>
              );
            },
        overlayColor: "transparent",
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Editor" component={EditorScreen} />
      <Drawer.Screen name="Page" component={PageScreen} />
      <Drawer.Screen name="Settings" component={WorkspaceSettingsScreen} />
      <Drawer.Screen name="TestLibsodium" component={LibsodiumTestScreen} />
    </Drawer.Navigator>
  );
}

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Workspace"
        component={WorkspaceStackScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="DevDashboard" component={DevDashboardScreen} />
      <Stack.Screen name="DesignSystem" component={DesignSystemScreen} />
      <Stack.Screen name="NoWorkspace" component={NoWorkspaceScreen} />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EncryptDecryptImageTest"
        component={EncryptDecryptImageTestScreen}
      />
      <Stack.Screen name="Root" component={RootScreen} />
      <Stack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: "Oops!" }}
      />
    </Stack.Navigator>
  );
}

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Workspace: {
        path: "/workspace/:workspaceId",
        screens: {
          Dashboard: "dashboard",
          Editor: "editor",
          Page: "page/:pageId",
          TestLibsodium: "test-libsodium",
          Settings: "settings",
        },
      },
      NoWorkspace: "no-workspace",
      DevDashboard: "dev-dashboard",
      DesignSystem: "design-system",
      Register: "register",
      Login: "login",
      EncryptDecryptImageTest: "encrypt-decrypt-image-test",
      Root: "",
      NotFound: "*",
    },
  },
};

export default function Navigation({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  return (
    <NavigationContainer
      linking={linking}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}
