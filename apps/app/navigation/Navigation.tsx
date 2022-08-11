import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  ColorSchemeName,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";

import NotFoundScreen from "./screens/NotFoundScreen";
import { RootStackParamList } from "../types/navigation";
import NoPageExistsScreen from "./screens/NoPageExistsScreen";
import DevDashboardScreen from "./screens/DevDashboardScreen";
import PageScreen from "./screens/PageScreen";
import LibsodiumTestScreen from "./screens/LibsodiumTestScreen";
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import WorkspaceSettingsScreen from "./screens/WorkspaceSettingsScreen";
import DesignSystemScreen from "./screens/DesignSystemScreen";
import Sidebar from "../components/sidebar/Sidebar";
import EncryptDecryptImageTestScreen from "./screens/EncryptDecryptImageTestScreen";
import AcceptWorkspaceInvitationScreen from "./screens/AcceptWorkspaceInvitationScreen";
import DeviceManagerScreen from "./screens/DeviceManagerScreen";
import {
  BoxShadow,
  Button,
  Text,
  tw,
  useIsPermanentLeftSidebar,
  View,
} from "@serenity-tools/ui";
import RootScreen from "./screens/RootScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import RegistrationVerificationScreen from "./screens/RegistrationVerificationScreen";
import WorkspaceRootScreen from "./screens/WorkspaceRootScreen";
import { WorkspaceIdProvider } from "../context/WorkspaceIdContext";
import { useEffect, useLayoutEffect, useRef } from "react";
import { setLastUsedWorkspaceId } from "../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { PageHeaderLeft } from "../components/pageHeaderLeft/PageHeaderLeft";
import WorkspaceNotFoundScreen from "./screens/WorkspaceNotFoundScreen";

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

const styles = StyleSheet.create({
  // web prefix needed as this otherwise messes with the height-calculation for mobile
  header: tw`web:h-top-bar bg-white dark:bg-gray-900 border-b border-gray-200 shadow-opacity-0`,
});

function WorkspaceStackScreen(props) {
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (props.route.params?.workspaceId) {
      setLastUsedWorkspaceId(props.route.params.workspaceId);
    }
  });

  if (!props.route.params) {
    return null;
  }

  return (
    <WorkspaceIdProvider value={props.route.params.workspaceId}>
      <Drawer.Navigator
        drawerContent={(props) => <Sidebar {...props} />}
        screenOptions={{
          unmountOnBlur: true,
          headerShown: true,
          headerTitle: (props) => <Text>{props.children}</Text>,
          headerStyle: [styles.header],
          drawerType: isPermanentLeftSidebar ? "permanent" : "front",
          drawerStyle: {
            width: isPermanentLeftSidebar ? 240 : width,
          },
          headerLeft: isPermanentLeftSidebar
            ? () => null
            : () => <PageHeaderLeft navigation={props.navigation} />,
          overlayColor: "transparent",
        }}
      >
        <Drawer.Screen name="Page" component={PageScreen} />
        <Drawer.Screen name="Settings" component={WorkspaceSettingsScreen} />
        <Drawer.Screen
          name="WorkspaceRoot"
          component={WorkspaceRootScreen}
          options={{ headerShown: false }}
        />
        <Drawer.Screen name="DeviceManager" component={DeviceManagerScreen} />
        <Drawer.Screen
          name="NoPageExists"
          component={NoPageExistsScreen}
          options={{ headerShown: false }}
        />
      </Drawer.Navigator>
    </WorkspaceIdProvider>
  );
}

function ModalScreen({ navigation }) {
  // TODO onclick on overlay should close the modal
  // TODO close button should look for back and if not go to root

  const wrapperRef = useRef(null);
  useLayoutEffect(() => {
    if (Platform.OS === "web") {
      const modalGroup = wrapperRef.current.parentNode.parentNode.parentNode;
      // since we have stack navigator multiple screens are rendered, but set to display none
      const previousScreen =
        modalGroup.parentNode.children[
          modalGroup.parentNode.children.length - 2
        ];
      previousScreen.style.display = "block"; // make sure the main content is available
      modalGroup.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
      // window.modalGroup = modalGroup;
      // window.mainGroup = mainGroup;
    }
  });

  return (
    <View
      ref={wrapperRef}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <BoxShadow elevation={2} rounded>
        <View
          style={{
            backgroundColor: "white",
            width: "90vw",
            height: "90vh",
          }}
        >
          <Text style={{ fontSize: 30 }}>This is a modal!</Text>
          <Button onPress={() => navigation.goBack()}>Back</Button>
        </View>
      </BoxShadow>
    </View>
  );
}

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Group>
        <Stack.Screen
          name="Root"
          component={RootScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Workspace"
          component={WorkspaceStackScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="DesignSystem" component={DesignSystemScreen} />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RegistrationVerification"
          component={RegistrationVerificationScreen}
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
        <Stack.Screen name="TestLibsodium" component={LibsodiumTestScreen} />
        <Stack.Screen name="DevDashboard" component={DevDashboardScreen} />
        <Stack.Screen
          name="AcceptWorkspaceInvitation"
          component={AcceptWorkspaceInvitationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WorkspaceNotFound"
          component={WorkspaceNotFoundScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NotFound"
          component={NotFoundScreen}
          options={{ headerShown: false }}
        />
      </Stack.Group>
      <Stack.Group
        screenOptions={{
          presentation: "modal",
          // contentStyle: { backgroundColor: "red" },
          headerShown: false,
        }}
      >
        <Stack.Screen name="UserSettings" component={ModalScreen} />
      </Stack.Group>
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
          NoPageExists: "no-page-exits",
          Page: "page/:pageId",
          Settings: "settings",
          DeviceManager: "devices",
          WorkspaceRoot: "",
        },
      },
      Onboarding: "onboarding",
      DevDashboard: "dev-dashboard",
      DesignSystem: "design-system",
      Register: "register",
      RegistrationVerification: "registration-verification",
      Login: "login",
      EncryptDecryptImageTest: "encrypt-decrypt-image-test",
      AcceptWorkspaceInvitation:
        "accept-workspace-invitation/:workspaceInvitationId",
      TestLibsodium: "test-libsodium",
      UserSettings: "user-settings",
      Root: "",
      NotFound: "*",
    },
  },
};

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: tw.color("white") as string,
    border: tw.color("gray-200") as string,
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
      theme={colorScheme === "dark" ? DarkTheme : LightTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}
