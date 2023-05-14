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
      // @ts-expect-error tabpanel is needed for web accessibility
      accessibilityRole={Platform.OS === "web" ? "tabpanel" : undefined}
      accessibilityLabelledBy={`${props.tabId}-tab`}
      nativeID={`${props.tabId}-panel`}
      style={tw`py-4`}
      {...props}
    />
  );
}
