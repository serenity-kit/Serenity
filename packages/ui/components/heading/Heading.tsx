import React from "react";
import { Platform, Text as RNText, StyleSheet } from "react-native";
import { tw } from "../../tailwind";

export type HeadingProps = RNText["props"] & {
  lvl: 1 | 2 | 3 | 4;
  center?: boolean;
  padded?: boolean;
  accessibilityOnly?: boolean; // set to visually hide element but leave it in for accessibility reasons
  muted?: boolean;
};

export const Heading = (props: HeadingProps) => {
  const { lvl, padded, muted } = props;

  const styles = StyleSheet.create({
    // flex needed to make them "block" elements which can have margins
    // (display: block not available for native)

    // 1.75rem (28px) - login / registration
    1: tw.style(
      `flex text-2xl md:text-3xl text-gray-900 dark:text-white`,
      padded && tw`mb-3`,
      {
        fontFamily: "Inter_700Bold",
      }
    ),
    // 1.5rem (24px) - context-header web (e.g. Settings Modal)
    2: tw.style(
      `flex text-2xl text-gray-900 dark:text-white`,
      padded && tw`mb-2.5`,
      {
        fontFamily: "Inter_600SemiBold",
      }
    ),
    // 1rem (16px) - form-header (e.g. "Manage devices" in Settings Modal)
    3: tw.style(
      `flex text-base text-gray-900 dark:text-white`,
      padded && tw`mb-2`,
      {
        fontFamily: "Inter_600SemiBold",
      }
    ),
    // 0.75rem (12px) - sidebar-headers (e.g. "Folders" in Sidebar)
    4: tw.style(
      `flex text-sm md:text-xxs text-gray-900 md:text-gray-800 dark:text-white`,
      padded && tw`mb-2`,
      {
        fontFamily: "Inter_500Medium",
      }
    ),
    muted: tw`text-muted`,
    accessibilityOnly: tw`hidden`,
  });

  return (
    <RNText
      {...props}
      style={[
        styles[lvl],
        props.accessibilityOnly ? styles.accessibilityOnly : undefined,
        props.center && tw`justify-center text-center`, // justify for web, text-center for iOS
        muted && styles.muted,
        props.style,
      ]}
      role={Platform.OS === "web" ? "heading" : undefined}
      aria-level={lvl}
    >
      {props.children}
    </RNText>
  );
};
