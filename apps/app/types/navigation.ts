import { NavigatorScreenParams } from "@react-navigation/native";

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
  WorkspaceNotDecrypted: undefined;
  WorkspaceRoot: undefined;
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
