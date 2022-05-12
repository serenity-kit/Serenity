import React from "react";
import { View as RNView, StyleSheet } from "react-native";
import { tw } from "../../tailwind";

export type SidebarDividerProps = RNView["props"];

const styles = StyleSheet.create({
  view: tw`border-b border-gray-200 my-6`,
});

export const SidebarDivider = React.forwardRef(function View(
  props: SidebarDividerProps,
  ref: React.Ref<RNView> | undefined
) {
  return <RNView ref={ref} {...props} style={[styles.view, props.style]} />;
});
