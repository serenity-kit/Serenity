import React from "react";
import { View as RNView, StyleSheet } from "react-native";
import { tw } from "../../tailwind";

export type EditorBottombarDividerProps = RNView["props"] & {
  collapsed?: boolean;
};

const styles = StyleSheet.create({
  default: tw`h-6 mx-0.5 border-r border-gray-300`,
  collapsed: tw`mx-0`,
});

export const EditorBottombarDivider = React.forwardRef(function View(
  props: EditorBottombarDividerProps,
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
