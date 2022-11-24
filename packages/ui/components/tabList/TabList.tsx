import React from "react";
import { tw } from "../../tailwind";
import { View, ViewProps } from "../view/View";

export type TabListProps = ViewProps & {
  accessibilityLabel: string;
};

export function TabList(props: TabListProps) {
  return (
    <View
      {...props}
      accessibilityRole="tablist"
      style={[
        tw`flex-row -mx-2 py-2.5 px-4 border-b border-gray-200`,
        props.style,
      ]}
    />
  );
}
