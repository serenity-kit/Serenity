import React from "react";
import { View, ViewProps } from "../view/View";

export type TabListProps = ViewProps & {
  accessibilityLabel: string;
};

export function TabList(props: TabListProps) {
  return <View accessibilityRole="tablist" {...props} />;
}
