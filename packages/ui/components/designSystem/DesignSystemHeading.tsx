import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Text, TextProps, TextVariants } from "../text/Text";

export type DesignSystemHeadingProps = TextProps & {
  lvl: 1 | 2 | 3 | 4;
};

export const DesignSystemHeading = (props: DesignSystemHeadingProps) => {
  const { lvl } = props;
  // TextVariants indexed from 1(0) to  4(3) to fit heading levels
  const variants: TextVariants[] = ["large", "medium", "medium", "xs"];

  const styles = StyleSheet.create({
    1: tw`mt-12 mb-4 text-4xl`,
    2: tw`mt-6 mb-1.5 text-xl`,
    3: tw`mt-7 mb-0.5`,
    4: tw`mt-6 mb-1 text-primary-400`,
  });

  return (
    <Text
      {...props}
      variant={variants[lvl - 1]}
      style={[styles[lvl], props.style]}
      bold
    >
      {props.children}
    </Text>
  );
};
