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

export type AppDrawerParamList = {
  Dashboard: undefined;
  Editor: undefined;
  TestEditor: undefined;
  TestLibsodium: undefined;
};

export type RootStackParamList = {
  App: NavigatorScreenParams<AppDrawerParamList> | undefined;
  DesignSystem: undefined;
  DevDashboard: undefined;
  Register: undefined;
  Login: undefined;
  EncryptDecryptImageTest: undefined;
  NotFound: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type RootTabScreenProps<Screen extends keyof AppDrawerParamList> =
  CompositeScreenProps<
    DrawerScreenProps<AppDrawerParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >;
