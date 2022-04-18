/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";

import { RootStackParamList } from "../types";

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      App: {
        path: "app",
        screens: {
          Dashboard: "dashboard",
          Editor: "editor",
          TestEditor: "test-editor",
          TestLibsodium: "test-libsodium",
        },
      },
      DevDashboard: "dev-dashboard",
      DesignSystem: "design-system",
      Register: "register",
      Login: "login",
      NotFound: "*",
    },
  },
};

export default linking;
