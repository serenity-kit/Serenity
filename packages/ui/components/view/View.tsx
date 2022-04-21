import React from "react";
import { View as RNView, StyleSheet } from "react-native";
import { ThemeProps } from "../../types";
export type ViewProps = ThemeProps & RNView["props"];
import { tw } from "../../tailwind";

const styles = StyleSheet.create({
  view: tw`bg-white dark:bg-gray-900`,
});

export const View = React.forwardRef(function View(
  props: ViewProps,
  ref: React.LegacyRef<RNView> | undefined
) {
  console.log("weee", props.style);
  return <RNView ref={ref} {...props} style={[styles.view, props.style]} />;
});
