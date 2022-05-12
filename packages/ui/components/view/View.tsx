import React from "react";
import { View as RNView, StyleSheet } from "react-native";
import { tw } from "../../tailwind";
export type ViewProps = RNView["props"];

export const View = React.forwardRef(function View(
  props: ViewProps,
  ref: React.Ref<RNView> | undefined
) {
  const styles = StyleSheet.create({
    view: tw`bg-white dark:bg-gray-900`,
  });

  return <RNView ref={ref} {...props} style={[styles.view, props.style]} />;
});
