/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { DrawerScreenProps } from "@react-navigation/drawer";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

type PageParams = {
  pageId: string;
  isNew?: boolean;
};

type WorkspacePageParams = {
  workspaceId: string;
};

type LoginParams = {
  next: string;
};

type RegistrationVerificationParams = {
  username?: string;
  verification?: string;
};

export type WorkspaceDrawerParamList = {
  Page: PageParams;
  Settings: undefined;
  WorkspaceNotDecrypted: undefined;
  WorkspaceRoot: undefined;
};

export type WorkspaceParams = NavigatorScreenParams<WorkspaceDrawerParamList> &
  WorkspacePageParams;

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
  | (NavigatorScreenParams<WorkspaceSettingsDrawerParamList> &
      WorkspacePageParams)
  // phone params
  | WorkspacePageParams;

export type WorkspaceInvitationParams = {
  workspaceInvitationId: string;
};

export type RootStackParamList = {
  Workspace: WorkspaceParams;
  WorkspaceSettings: WorkspaceSettingsParams;
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
  FileUploadTest: undefined;
  TestLibsodium: undefined;
  AccountSettings: AccountSettingsParams | undefined;
  AccountSettingsProfile: undefined; // on phones
  AccountSettingsDevices: undefined; // on phones
  WorkspaceSettingsGeneral: undefined; // on phones
  WorkspaceSettingsMembers: undefined; // on phones
  Root: undefined;
  NotFound: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type WorkspaceDrawerScreenProps<
  Screen extends keyof WorkspaceDrawerParamList
> = CompositeScreenProps<
  DrawerScreenProps<WorkspaceDrawerParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;

export type RouteDescription = {
  screen: keyof RootStackParamList;
  params: LoginParams | WorkspaceParams | WorkspaceInvitationParams | undefined;
};
