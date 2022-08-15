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
import AccountSettingsSidebar from "../components/accountSettingsSidebar/AccountSettingsSidebar";
import AccountProfileSettingsScreen from "./screens/AccountProfileSettingsScreen";
import AccountSettingsMobileOverviewScreen from "./screens/AccountSettingsMobileOverviewScreen";
import WorkspaceSettingsMembersScreen from "./screens/WorkspaceSettingsMembersScreen";
import WorkspaceSettingsGeneralScreen from "./screens/WorkspaceSettingsGeneralScreen";
import WorkspaceSettingsMobileOverviewScreen from "./screens/WorkspaceSettingsMobileOverviewScreen";
import WorkspaceSettingsSidebar from "../components/workspaceSettingsSidebar/WorkspaceSettingsSidebar";
import NavigationDrawerModal from "../components/navigationDrawerModal/NavigationDrawerModal";

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();
const AccountSettingsDrawer = createDrawerNavigator(); // for desktop and tablet
const WorkspaceSettingsDrawer = createDrawerNavigator(); // for desktop and tablet

const styles = StyleSheet.create({
  // web prefix needed as this otherwise messes with the height-calculation for mobile
  header: tw`web:h-top-bar bg-white dark:bg-gray-900 border-b border-gray-200 shadow-opacity-0`,
});

const isPhoneDimensions = (width: number) => width < 768;

function WorkspaceDrawerScreen(props) {
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
        <Drawer.Screen
          name="WorkspaceRoot"
          component={WorkspaceRootScreen}
          options={{ headerShown: false }}
        />
        <Drawer.Screen
          name="NoPageExists"
          component={NoPageExistsScreen}
          options={{ headerShown: false }}
        />
      </Drawer.Navigator>
    </WorkspaceIdProvider>
  );
}

function WorkspaceSettingsDrawerScreen(props) {
  return (
    <NavigationDrawerModal {...props}>
      <WorkspaceIdProvider value={props.route.params.workspaceId}>
        <WorkspaceSettingsDrawer.Navigator
          drawerContent={(props) => <WorkspaceSettingsSidebar {...props} />}
          screenOptions={{
            unmountOnBlur: true,
            headerShown: false,
            drawerType: "permanent",
          }}
        >
          <WorkspaceSettingsDrawer.Screen
            name="General"
            component={WorkspaceSettingsGeneralScreen}
          />
          <WorkspaceSettingsDrawer.Screen
            name="Members"
            component={WorkspaceSettingsMembersScreen}
          />
        </WorkspaceSettingsDrawer.Navigator>
      </WorkspaceIdProvider>
    </NavigationDrawerModal>
  );
}

function AccountSettingsDrawerScreen(props) {
  return (
    <NavigationDrawerModal {...props}>
      <AccountSettingsDrawer.Navigator
        drawerContent={(props) => <AccountSettingsSidebar {...props} />}
        screenOptions={{
          unmountOnBlur: true,
          headerShown: false,
          drawerType: "permanent",
        }}
      >
        <AccountSettingsDrawer.Screen
          name="Profile"
          component={AccountProfileSettingsScreen}
        />
        <AccountSettingsDrawer.Screen
          name="Devices"
          component={DeviceManagerScreen}
        />
      </AccountSettingsDrawer.Navigator>
    </NavigationDrawerModal>
  );
}

function RootNavigator() {
  const dimensions = useWindowDimensions();

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
          component={WorkspaceDrawerScreen}
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

        {isPhoneDimensions(dimensions.width) ? (
          <>
            <Stack.Screen
              name="AccountSettings"
              component={AccountSettingsMobileOverviewScreen}
            />
            <Stack.Screen
              name="AccountSettingsProfile"
              component={AccountProfileSettingsScreen}
            />
            <Stack.Screen
              name="AccountSettingsDevices"
              component={DeviceManagerScreen}
            />
            <Stack.Screen
              name="WorkspaceSettings"
              component={WorkspaceSettingsMobileOverviewScreen}
            />
            <Stack.Screen
              name="WorkspaceSettingsGeneral"
              component={WorkspaceSettingsGeneralScreen}
            />
            <Stack.Screen
              name="WorkspaceSettingsMembers"
              component={WorkspaceSettingsMembersScreen}
            />
          </>
        ) : null}
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
          headerShown: false,
        }}
      >
        {!isPhoneDimensions(dimensions.width) ? (
          <>
            <Stack.Screen
              name="AccountSettings"
              component={AccountSettingsDrawerScreen}
            />
            <Stack.Screen
              name="WorkspaceSettings"
              component={WorkspaceSettingsDrawerScreen}
            />
          </>
        ) : null}
      </Stack.Group>
    </Stack.Navigator>
  );
}

const getLinking = (
  isPhoneDimensions: boolean
): LinkingOptions<RootStackParamList> => {
  const accountSettings = isPhoneDimensions
    ? {
        AccountSettings: "/account-settings",
        AccountSettingsProfile: "/account-settings/profile",
        AccountSettingsDevices: "/account-settings/devices",
      }
    : {
        AccountSettings: {
          path: "/account-settings",
          screens: {
            Profile: "profile",
            Devices: "devices",
          },
        },
      };

  const workspaceSettings = isPhoneDimensions
    ? {
        WorkspaceSettings: "/workspace/:workspaceId/settings",
        WorkspaceSettingsGeneral: "/workspace/:workspaceId/settings/general",
        WorkspaceSettingsMembers: "/workspace/:workspaceId/settings/members",
      }
    : {
        WorkspaceSettings: {
          path: "/workspace/:workspaceId/settings",
          screens: {
            General: "general",
            Members: "members",
          },
        },
      };

  return {
    prefixes: [Linking.createURL("/")],
    config: {
      screens: {
        ...workspaceSettings,
        Workspace: {
          path: "/workspace/:workspaceId",
          screens: {
            NoPageExists: "no-page-exits",
            Page: "page/:pageId",
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
        ...accountSettings,
        Root: "",
        NotFound: "*",
      },
    },
  };
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
  const dimensions = useWindowDimensions();

  return (
    <NavigationContainer
      linking={getLinking(isPhoneDimensions(dimensions.width))}
      theme={colorScheme === "dark" ? DarkTheme : LightTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}
