import React from "react";
import { Platform } from "react-native";
import { tw } from "../../tailwind";
import { View, ViewProps } from "../view/View";

export type TabPanelProps = ViewProps & {
  tabId: string;
};

export function TabPanel(props: TabPanelProps) {
  return (
    <View
      role={Platform.OS === "web" ? "tabpanel" : undefined}
      aria-labelledby={`${props.tabId}-tab`}
      id={`${props.tabId}-panel`}
      style={tw`py-4`}
      {...props}
    />
  );
}
