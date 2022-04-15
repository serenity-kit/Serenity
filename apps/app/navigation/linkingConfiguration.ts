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
      dashboard: "dashboard",
      ["design-system"]: "design-system",
      editor: "editor",
      ["test-editor"]: "test-editor",
      ["test-libsodium"]: "test-libsodium",
      notFound: "*",
    },
  },
};

export default linking;
