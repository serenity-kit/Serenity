import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { tw } from "../../tailwind";

export type MonoVariants = "medium" | "small" | "xs";

export type MonoProps = RNText["props"] & {
  muted?: boolean;
  variant?: MonoVariants;
};

export function Mono(props: MonoProps) {
  const { variant = "small" } = props;
  const styles = StyleSheet.create({
    // 1rem (16px)
    medium: tw.style(`text-base text-gray-900 dark:text-white`, {
      fontFamily: "space-mono",
    }),
    // 0.875rem (14px)
    small: tw.style(`text-sm text-gray-900 dark:text-white`, {
      fontFamily: "space-mono",
    }),
    // 0.8125rem (13px)
    xs: tw.style(`text-xs text-gray-900 dark:text-white`, {
      fontFamily: "space-mono",
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
