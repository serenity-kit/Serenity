import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Text, TextProps } from "../text/Text";

export type DesignSystemHeaderProps = TextProps & {};

export const DesignSystemHeader = (props: DesignSystemHeaderProps) => {
  const styles = StyleSheet.create({
    header: tw`mt-12 mb-4 text-4xl`,
  });

  return (
    <Text {...props} variant="large" style={[styles.header, props.style]} bold>
      {props.children}
    </Text>
  );
};
