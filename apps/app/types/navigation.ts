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

type LoginParams = {
  next?: string;
};

type RegistrationVerificationParams = {
  username?: string;
  verification?: string;
};

export type WorkspaceDrawerParamList = {
  NoPageExists: undefined;
  Page: PageParams;
  Settings: undefined;
  DeviceManager: undefined;
  WorkspaceRoot: undefined;
};

export type WorkspaceParams =
  NavigatorScreenParams<WorkspaceDrawerParamList> & {
    workspaceId: string;
  };

export enum WorkspaceInvitationAcceptParam {
  ACCEPT = "1",
  DO_NOT_ACCEPT = "",
}
export type WorkspaceInvitationParams = {
  workspaceInvitationId: string;
  accept?: WorkspaceInvitationAcceptParam;
};

export type RootStackParamList = {
  Workspace: WorkspaceParams;
  Onboarding: undefined;
  DesignSystem: undefined;
  DevDashboard: undefined;
  Register: undefined;
  RegistrationVerification: RegistrationVerificationParams;
  AcceptWorkspaceInvitation: WorkspaceInvitationParams;
  WorkspaceNotFound: undefined;
  Login: LoginParams;
  EncryptDecryptImageTest: undefined;
  TestLibsodium: undefined;
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
