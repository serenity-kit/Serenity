import { DrawerScreenProps } from "@react-navigation/drawer";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type PageParams = {
  pageId: string;
  isNew?: boolean;
};

type WorkspacePageParams = {
  workspaceId: string;
};

type RegistrationVerificationParams = {
  username?: string;
  verification?: string;
};

export type WorkspaceDrawerParamList = {
  Page: PageParams;
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
  | WorkspacePageParams;

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
  NavigatorScreenParams<WorkspaceStackParamList> & WorkspacePageParams;

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
  Login: LoginParams | undefined;
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

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type WorkspaceRouteProps<Screen extends keyof WorkspaceStackParamList> =
  NativeStackScreenProps<WorkspaceStackParamList, Screen>;

// TODO
export type WorkspaceDrawerScreenProps<
  Screen extends keyof WorkspaceDrawerParamList
> = CompositeScreenProps<
  DrawerScreenProps<WorkspaceDrawerParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
