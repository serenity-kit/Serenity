import React from "react";
import { View, ViewProps } from "../view/View";

export type TabPanelProps = ViewProps & {
  tabId: string;
};

export function TabPanel(props: TabPanelProps) {
  return (
    <View
      // @ts-expect-error tabpanel is needed for web accessibility
      accessibilityRole="tabpanel"
      accessibilityLabelledBy={`${props.tabId}-tab`}
      nativeID={`${props.tabId}-panel`}
      {...props}
    />
  );
}
