import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { View, ViewProps } from "../view/View";

export type DesignSystemExampleAreaProps = ViewProps & {};

export const DesignSystemExampleArea = (
  props: DesignSystemExampleAreaProps
) => {
  const styles = StyleSheet.create({
    area: tw`h-60 border border-gray-200 rounded overflow-hidden`,
  });

  return (
    <View {...props} style={[styles.area, props.style]}>
      {props.children}
    </View>
  );
};
