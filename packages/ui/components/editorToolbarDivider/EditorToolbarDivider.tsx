import React from "react";
import { View as RNView, StyleSheet } from "react-native";
import { tw } from "../../tailwind";

export type EditorToolbarDividerProps = RNView["props"] & {
  collapsed?: boolean;
};

const styles = StyleSheet.create({
  default: tw`h-8 mx-0.5 border-r border-gray-200`,
  collapsed: tw`mx-0`,
});

export const EditorToolbarDivider = React.forwardRef(function View(
  props: EditorToolbarDividerProps,
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
