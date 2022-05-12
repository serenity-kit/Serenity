import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { tw } from "../../tailwind";

export type TextProps = RNText["props"] & {
  bold?: boolean;
  muted?: boolean;
  variant?: "large" | "medium" | "small" | "tiny";
};

export function Text(props: TextProps) {
  const { variant = "medium", bold = false } = props;
  const styles = StyleSheet.create({
    large: tw.style(`text-h1 text-gray-900 dark:text-white`, {
      fontFamily: bold ? "Inter_800ExtraBold" : "Inter_600SemiBold",
    }),
    medium: tw.style(`text-base text-gray-900 dark:text-white`, {
      fontFamily: bold ? "Inter_600SemiBold" : "Inter_400Regular",
    }),
    small: tw.style(`text-sm text-gray-800 dark:text-white`, {
      fontFamily: bold ? "Inter_600SemiBold" : "Inter_400Regular",
    }),
    tiny: tw.style(`text-xs text-gray-900 dark:text-white`, {
      fontFamily: bold ? "Inter_600SemiBold" : "Inter_400Regular",
    }),
    muted: tw`text-muted`,
  });

  return (
    <RNText
      {...props}
      style={[
        styles[variant],
        props.muted ? styles.muted : undefined,
        props.style,
      ]}
    />
  );
}
