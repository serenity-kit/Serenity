import { NavigatorScreenParams, ParamListBase } from "@react-navigation/native";

// see https://github.com/react-navigation/react-navigation/issues/6931#issuecomment-958749155
interface ISubNavigator<T extends ParamListBase, K extends keyof T> {
  screen: K;
  params?: T[K];
}

type PageParamList = {
  isNew?: boolean;
};

type WorkspacePageParamList = {
  workspaceId: string;
};

type RegistrationVerificationParamsList = {
  username?: string;
  verification?: string;
};

export type PageCommentsDrawerParamList = {
  Page: PageParamList;
};

export type WorkspaceDrawerParamList = {
  PageCommentsDrawer: ISubNavigator<
    PageCommentsDrawerParamList,
    keyof PageCommentsDrawerParamList
  > & { pageId: string };
  WorkspaceNotDecrypted: undefined;
  WorkspaceRoot: undefined;
};

export type WorkspaceDrawerParams =
  NavigatorScreenParams<WorkspaceDrawerParamList>;

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

type SharePageParamList = {
  documentId: string;
  token: string;
};

export type SharePageParams = NavigatorScreenParams<SharePageParamList> &
  SharePageParamList;

export type RootStackParamList = {
  Workspace: WorkspaceStackParams;
  Onboarding: undefined;
  DesignSystem: undefined;
  DevDashboard: undefined;
  Register: undefined;
  RegistrationVerification: RegistrationVerificationParamsList;
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
  SharePage: SharePageParams;
  Root: undefined;
  NotFound: undefined;
};
