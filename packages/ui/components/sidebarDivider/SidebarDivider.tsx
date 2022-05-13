import React from "react";
import { View as RNView, StyleSheet } from "react-native";
import { tw } from "../../tailwind";

export type SidebarDividerProps = RNView["props"] & {
  collapsed?: boolean;
};

const styles = StyleSheet.create({
  default: tw`border-b border-gray-200 my-6`,
  collapsed: tw`my-0`,
});

export const SidebarDivider = React.forwardRef(function View(
  props: SidebarDividerProps,
  ref: React.Ref<RNView> | undefined
) {
  return (
    <RNView
      ref={ref}
      {...props}
      style={[styles.default, props.collapsed && styles.collapsed, props.style]}
    />
  );
});
