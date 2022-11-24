import { DrawerScreenProps } from "@react-navigation/drawer";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  RootStackParamList,
  WorkspaceDrawerParamList,
  WorkspaceStackParamList,
} from "./navigation";

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
