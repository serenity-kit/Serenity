import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { tw } from "../../tailwind";

export type TextProps = RNText["props"] & {
  small?: boolean;
  muted?: boolean;
};

export function Text(props: TextProps) {
  const styles = StyleSheet.create({
    text: tw`text-base text-gray-900 dark:text-white`,
    small: tw`small`,
    muted: tw`text-muted`,
  });

  return (
    <RNText
      {...props}
      style={[
        styles.text,
        props.small ? styles.small : undefined,
        props.muted ? styles.muted : undefined,
        props.style,
      ]}
    />
  );
}
