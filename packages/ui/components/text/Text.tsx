import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { tw } from "../../tailwind";

export type TextVariants = "large" | "medium" | "small" | "xs" | "xxs";

export type TextProps = RNText["props"] & {
  bold?: boolean;
  muted?: boolean;
  variant?: TextVariants;
  // inspired by https://github.com/necolas/react-native-web/issues/1684#issuecomment-1022716132
  // https://github.com/necolas/react-native-web/blob/master/packages/react-native-web/src/modules/AccessibilityUtil/propsToAccessibilityComponent.js#L12
  accessibilityLevel?: number;
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
