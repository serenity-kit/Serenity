import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Text, TextProps } from "../text/Text";

export type DesignSystemSubHeaderProps = TextProps & {};

export const DesignSystemSubHeader = (props: DesignSystemSubHeaderProps) => {
  const styles = StyleSheet.create({
    subHeader: tw`mt-5 mb-1.5 text-xl`,
  });

  return (
    <Text
      {...props}
      variant="medium"
      style={[styles.subHeader, props.style]}
      bold
    >
      {props.children}
    </Text>
  );
};
