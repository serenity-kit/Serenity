import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  DarkTheme,
  DefaultTheme,
  LinkingOptions,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, tw, useIsPermanentLeftSidebar } from "@serenity-tools/ui";
import * as Linking from "expo-linking";
import { useEffect } from "react";
import { ColorSchemeName, StyleSheet, useWindowDimensions } from "react-native";
import { useClient } from "urql";
import AccountSettingsSidebar from "../components/accountSettingsSidebar/AccountSettingsSidebar";
import NavigationDrawerModal from "../components/navigationDrawerModal/NavigationDrawerModal";
import { PageHeaderLeft } from "../components/pageHeaderLeft/PageHeaderLeft";
import Sidebar from "../components/sidebar/Sidebar";
import WorkspaceSettingsSidebar from "../components/workspaceSettingsSidebar/WorkspaceSettingsSidebar";
import { useAppContext } from "../context/AppContext";
import { WorkspaceIdProvider } from "../context/WorkspaceIdContext";
import { redirectToLoginIfMissingTheActiveDeviceOrSessionKey } from "../higherOrderComponents/redirectToLoginIfMissingTheActiveDeviceOrSessionKey";
import { useInterval } from "../hooks/useInterval";
import { RootStackParamList } from "../types/navigation";
import { setLastUsedWorkspaceId } from "../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import {
  addNewMembersIfNecessary,
  secondsBetweenNewMemberChecks,
} from "../utils/workspace/addNewMembersIfNecessary";
import AcceptWorkspaceInvitationScreen from "./screens/acceptWorkspaceInvitationScreen/AcceptWorkspaceInvitationScreen";
import AccountDevicesSettingsScreen from "./screens/accountDevicesSettingsScreen/AccountDevicesSettingsScreen";
import AccountProfileSettingsScreen from "./screens/accountProfileSettingsScreen/AccountProfileSettingsScreen";
import AccountSettingsMobileOverviewScreen from "./screens/accountSettingsMobileOverviewScreen/AccountSettingsMobileOverviewScreen";
import DesignSystemScreen from "./screens/designSystemScreen/DesignSystemScreen";
import DevDashboardScreen from "./screens/devDashboardScreen/DevDashboardScreen";
import EncryptDecryptImageTestScreen from "./screens/encryptDecryptImageTestScreen/EncryptDecryptImageTestScreen";
import LibsodiumTestScreen from "./screens/libsodiumTestScreen/LibsodiumTestScreen";
import LoginScreen from "./screens/loginScreen/LoginScreen";
import NotFoundScreen from "./screens/notFoundScreen/NotFoundScreen";
import OnboardingScreen from "./screens/onboardingScreen/OnboardingScreen";
import PageScreen from "./screens/pageScreen/PageScreen";
import RegisterScreen from "./screens/registerScreen/RegisterScreen";
import RegistrationVerificationScreen from "./screens/registrationVerificationScreen/RegistrationVerificationScreen";
import RootScreen from "./screens/rootScreen/RootScreen";
import WorkspaceNotDecryptedScreen from "./screens/workspaceNotDecryptedScreen/WorkspaceNotDecryptedScreen";
import WorkspaceNotFoundScreen from "./screens/workspaceNotFoundScreen/WorkspaceNotFoundScreen";
import WorkspaceRootScreen from "./screens/workspaceRootScreen/WorkspaceRootScreen";
import WorkspaceSettingsGeneralScreen from "./screens/workspaceSettingsGeneralScreen/WorkspaceSettingsGeneralScreen";
import WorkspaceSettingsMembersScreen from "./screens/workspaceSettingsMembersScreen/WorkspaceSettingsMembersScreen";
import WorkspaceSettingsMobileOverviewScreen from "./screens/workspaceSettingsMobileOverviewScreen/WorkspaceSettingsMobileOverviewScreen";

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
  const urqlClient = useClient();
  const { activeDevice } = useAppContext();

  useInterval(() => {
    if (activeDevice) {
      addNewMembersIfNecessary({ urqlClient, activeDevice });
    }
  }, secondsBetweenNewMemberChecks * 1000);

  useEffect(() => {
    if (props.route.params?.workspaceId) {
      setLastUsedWorkspaceId(props.route.params.workspaceId);
    }
  }, [props.route.params?.workspaceId]);

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
          headerLeft: () => <PageHeaderLeft navigation={props.navigation} />,
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
          name="WorkspaceNotDecrypted"
          component={WorkspaceNotDecryptedScreen}
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
          component={AccountDevicesSettingsScreen}
        />
      </AccountSettingsDrawer.Navigator>
    </NavigationDrawerModal>
  );
}

const WorkspaceDrawerScreenWithLoginRedirect =
  redirectToLoginIfMissingTheActiveDeviceOrSessionKey(WorkspaceDrawerScreen);

const AccountSettingsMobileOverviewScreenWithLoginRedirect =
  redirectToLoginIfMissingTheActiveDeviceOrSessionKey(
    AccountSettingsMobileOverviewScreen
  );
const AccountProfileSettingsScreenWithLoginRedirect =
  redirectToLoginIfMissingTheActiveDeviceOrSessionKey(
    AccountProfileSettingsScreen
  );
const AccountDevicesSettingsScreenWithLoginRedirect =
  redirectToLoginIfMissingTheActiveDeviceOrSessionKey(
    AccountDevicesSettingsScreen
  );
const WorkspaceSettingsMobileOverviewScreenWithLoginRedirect =
  redirectToLoginIfMissingTheActiveDeviceOrSessionKey(
    WorkspaceSettingsMobileOverviewScreen
  );
const WorkspaceSettingsGeneralScreenWithLoginRedirect =
  redirectToLoginIfMissingTheActiveDeviceOrSessionKey(
    WorkspaceSettingsGeneralScreen
  );
const WorkspaceSettingsMembersScreenWithLoginRedirect =
  redirectToLoginIfMissingTheActiveDeviceOrSessionKey(
    WorkspaceSettingsMembersScreen
  );

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
          component={WorkspaceDrawerScreenWithLoginRedirect}
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
          name="WorkspaceNotDecrypted"
          component={WorkspaceNotDecryptedScreen}
        />
        {isPhoneDimensions(dimensions.width) ? (
          <>
            <Stack.Screen
              name="AccountSettings"
              component={AccountSettingsMobileOverviewScreenWithLoginRedirect}
            />
            <Stack.Screen
              name="AccountSettingsProfile"
              component={AccountProfileSettingsScreenWithLoginRedirect}
            />
            <Stack.Screen
              name="AccountSettingsDevices"
              component={AccountDevicesSettingsScreenWithLoginRedirect}
            />
            <Stack.Screen
              name="WorkspaceSettings"
              component={WorkspaceSettingsMobileOverviewScreenWithLoginRedirect}
            />
            <Stack.Screen
              name="WorkspaceSettingsGeneral"
              component={WorkspaceSettingsGeneralScreenWithLoginRedirect}
            />
            <Stack.Screen
              name="WorkspaceSettingsMembers"
              component={WorkspaceSettingsMembersScreenWithLoginRedirect}
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
        WorkspaceNotDecrypted: "/workspace/:workspaceId/lobby",
        WorkspaceNotFound: "/workspace/:workspaceId/not-found",
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
