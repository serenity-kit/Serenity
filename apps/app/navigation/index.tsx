import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { ColorSchemeName } from "react-native";

import NotFoundScreen from "../screens/NotFoundScreen";
import EditorScreen from "../screens/EditorScreen";
import { RootStackParamList } from "../types";
import linkingConfiguration from "./linkingConfiguration";
import DashboardScreen from "../screens/DashboardScreen";
import DevDashboardScreen from "../screens/DevDashboardScreen";
import TestEditorScreen from "../screens/TestEditorScreen";
import LibsodiumTestScreen from "../screens/LibsodiumTestScreen";
import RegisterScreen from "../screens/RegisterScreen";
import LoginScreen from "../screens/LoginScreen";
import DesignSystemScreen from "../screens/DesignSystemScreen";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Link } from "@serenity-tools/ui";

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <Link to={{ screen: "DevDashboard" }}>Dev Dashboard</Link>
      <Link to={{ screen: "App", params: { screen: "Editor" } }}>Editor</Link>
      <Link to={{ screen: "App", params: { screen: "TestEditor" } }}>
        Sync-Test-Editor
      </Link>
      <Link to={{ screen: "App", params: { screen: "TestLibsodium" } }}>
        Libsodium Test Screen
      </Link>
    </DrawerContentScrollView>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

function AuthorizedStackScreen() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={
        {
          // drawerType: "permanent",
        }
      }
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Editor" component={EditorScreen} />
      <Drawer.Screen name="TestEditor" component={TestEditorScreen} />
      <Drawer.Screen name="TestLibsodium" component={LibsodiumTestScreen} />
    </Drawer.Navigator>
  );
}

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="App"
        component={AuthorizedStackScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="DevDashboard" component={DevDashboardScreen} />
      <Stack.Screen name="DesignSystem" component={DesignSystemScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: "Oops!" }}
      />
    </Stack.Navigator>
  );
}

export default function Navigation({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  return (
    <NavigationContainer
      linking={linkingConfiguration}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}
