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

export type WorkspaceDrawerParamList = {
  Dashboard: undefined;
  Editor: undefined;
  TestEditor: undefined;
  TestLibsodium: undefined;
  WorkspaceSettings: undefined;
};

type WorkspaceParams = NavigatorScreenParams<WorkspaceDrawerParamList> & {
  workspaceId: string;
};

export type RootStackParamList = {
  Workspace: WorkspaceParams;
  DesignSystem: undefined;
  DevDashboard: undefined;
  Register: undefined;
  Login: undefined;
  EncryptDecryptImageTest: undefined;
  Root: undefined;
  WorkspaceSettingsScreen: undefined;
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
