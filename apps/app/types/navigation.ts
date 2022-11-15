import { DrawerScreenProps } from "@react-navigation/drawer";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type PageParamList = {
  pageId: string;
  isNew?: boolean;
};

type WorkspacePageParamList = {
  workspaceId: string;
};

type RegistrationVerificationParams = {
  username?: string;
  verification?: string;
};

export type WorkspaceDrawerParamList = {
  Page: PageParamList;
  Settings: undefined;
  WorkspaceNotDecrypted: undefined;
};

export type WorkspaceDrawerParams =
  | NavigatorScreenParams<WorkspaceDrawerParamList>
  | WorkspaceDrawerParamList;

export type AccountSettingsDrawerParamList = {
  Profile: undefined;
  Devices: undefined;
};

export type AccountSettingsParams =
  NavigatorScreenParams<AccountSettingsDrawerParamList>;

export type WorkspaceSettingsDrawerParamList = {
  General: undefined;
  Members: undefined;
};

// export type WorkspaceSettingsParams =
//   // tablet & desktop params
//   | NavigatorScreenParams<WorkspaceSettingsDrawerParamList>
//   // phone params
//   | WorkspacePageParams;

export type WorkspaceSettingsParams =
  // tablet & desktop params
  | NavigatorScreenParams<WorkspaceSettingsDrawerParamList>
  // phone params
  | WorkspacePageParamList;

export type WorkspaceInvitationParams = {
  workspaceInvitationId: string;
};

export type WorkspaceStackParamList = {
  WorkspaceSettingsMembers: undefined; // on phones
  WorkspaceSettingsGeneral: undefined; // on phones
  WorkspaceSettings:
    | WorkspaceSettingsParams // on phones
    | undefined; // on wide screens
  WorkspaceDrawer: WorkspaceDrawerParams;
  WorkspaceRoot: undefined;
};

export type WorkspaceStackParams =
  NavigatorScreenParams<WorkspaceStackParamList> & WorkspacePageParamList;

type LoginParams = {
  next: string;
};

export type RootStackParamList = {
  Workspace: WorkspaceStackParams;
  Onboarding: undefined;
  DesignSystem: undefined;
  DevDashboard: undefined;
  Register: undefined;
  RegistrationVerification: RegistrationVerificationParams;
  AcceptWorkspaceInvitation: WorkspaceInvitationParams;
  WorkspaceNotFound: undefined;
  Login: LoginParams | undefined; // the next inside LoginParams is optional
  LogoutInProgress: undefined;
  EncryptDecryptImageTest: undefined;
  TestLibsodium: undefined;
  AccountSettings:
    | AccountSettingsParams // on phones
    | undefined; // on wide screens
  AccountSettingsProfile: undefined; // on phones
  AccountSettingsDevices: undefined; // on phones
  SharePage: undefined;
  Root: undefined;
  NotFound: undefined;
};

/*
 * To be used in screens in the RootStack.
 * Screen Example: function LoginScreen(props: RootStackScreenProps<"Login">) {
 * Hook Example: const navigation = useNavigation<RootStackScreenProps<"Login">>();
 */
export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

/*
 * To be used in screens in the WorkspaceStack.
 * Screen Example: function WorkspaceRootScreen(props: WorkspaceStackScreenProps<"WorkspaceRoot">) {
 * Hook Example: const navigation = useNavigation<WorkspaceStackScreenProps<"WorkspaceRoot">>();
 */
export type WorkspaceStackScreenProps<
  Screen extends keyof WorkspaceStackParamList
> = CompositeScreenProps<
  NativeStackScreenProps<WorkspaceStackParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;

export type WorkspaceDrawerScreenProps<
  Screen extends keyof WorkspaceDrawerParamList
> = DrawerScreenProps<WorkspaceDrawerParamList, Screen>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
