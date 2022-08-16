import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Text, TextProps } from "../text/Text";

export type DesignSystemSubHeaderProps = TextProps & {};

export const DesignSystemSubHeader = (props: DesignSystemSubHeaderProps) => {
  const styles = StyleSheet.create({
    subHeader: tw`mt-4 mb-2`,
  });

  return (
    <Text
      {...props}
      variant="small"
      style={[styles.subHeader, props.style]}
      muted
    >
      {props.children}
    </Text>
  );
};
