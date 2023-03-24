import React from "react";
import { View as RNView, StyleSheet } from "react-native";
import { tw } from "../../tailwind";

export type VerticalDividerProps = RNView["props"] & {
  collapsed?: boolean;
};

const styles = StyleSheet.create({
  default: tw`h-full mx-0.5 border-r border-gray-150`,
  collapsed: tw`mx-0`,
});

export const VerticalDivider = React.forwardRef(function View(
  props: VerticalDividerProps,
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
