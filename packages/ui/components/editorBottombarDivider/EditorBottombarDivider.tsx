import React from "react";
import { View as RNView, StyleSheet } from "react-native";
import { tw } from "../../tailwind";

export type EditorBottombarDividerProps = RNView["props"] & {
  collapsed?: boolean;
};

const styles = StyleSheet.create({
  // TODO make tailwind md:h-6 work here
  default: tw`h-8 md:h-6 mx-0.5 border-r border-gray-200`,
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
