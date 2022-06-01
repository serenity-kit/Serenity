import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { tw } from "../../tailwind";

export type TextVariants = "large" | "medium" | "small" | "xs" | "xxs";

export type TextProps = RNText["props"] & {
  bold?: boolean;
  muted?: boolean;
  variant?: TextVariants;
};

export function Text(props: TextProps) {
  const { variant = "medium", bold = false } = props;
  const styles = StyleSheet.create({
    // 2rem (32px) - header
    large: tw.style(`text-h1 text-gray-900 dark:text-white`, {
      fontFamily: bold ? "Inter_700Bold" : "Inter_600SemiBold",
    }),
    // 1rem (16px) - basic text
    medium: tw.style(`text-base text-gray-900 dark:text-white`, {
      fontFamily: bold ? "Inter_600SemiBold" : "Inter_400Regular",
    }),
    // 0.875rem (14px) - sidebar
    small: tw.style(`text-sm text-gray-800 dark:text-white`, {
      fontFamily: bold ? "Inter_600SemiBold" : "Inter_400Regular",
    }),
    // 0.8125rem (13px) - ui hint
    xs: tw.style(`text-xs text-gray-900 dark:text-white`, {
      fontFamily: bold ? "Inter_600SemiBold" : "Inter_400Regular",
    }),
    // 0.75rem (12px) - sidebar-headers, input-hints
    xxs: tw.style(`text-xxs text-gray-900 dark:text-white`, {
      fontFamily: bold ? "Inter_500Medium" : "Inter_400Regular",
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
