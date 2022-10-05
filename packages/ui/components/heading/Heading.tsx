import React from "react";
import { StyleSheet, Platform, Text as RNText } from "react-native";
import { tw } from "../../tailwind";

export type HeadingProps = RNText["props"] & {
  lvl: 1 | 2 | 3 | 4;
  accessibilityOnly?: boolean; // set to visually hide element but leave it in for accessibility reasons
};

export const Heading = (props: HeadingProps) => {
  const { lvl } = props;

  const styles = StyleSheet.create({
    // 1.75rem (28px) - login / registration
    1: tw.style(`text-2xl md:text-3xl text-gray-900 dark:text-white`, {
      fontFamily: "Inter_700Bold",
    }),
    // 1.5rem (24px) - context-header web (e.g. Settings Modal)
    2: tw.style(`text-2xl text-gray-900 dark:text-white`, {
      fontFamily: "Inter_600SemiBold",
    }),
    // 1rem (16px) - form-header (e.g. "Manage devices" in Settings Modal)
    3: tw.style(`text-base text-gray-900 dark:text-white`, {
      fontFamily: "Inter_600SemiBold",
    }),
    // 0.75rem (12px) - sidebar-headers (e.g. "Folders" in Sidebar)
    4: tw.style(
      `text-sm md:text-xxs text-gray-900 md:text-gray-800 dark:text-white`,
      {
        fontFamily: "Inter_600SemiBold",
      }
    ),
    accessibilityOnly: tw`hidden`,
  });

  return (
    <RNText
      {...props}
      style={[
        styles[lvl],
        props.accessibilityOnly ? styles.accessibilityOnly : undefined,
        props.style,
      ]}
      // @ts-expect-error react-native-web needs react-native unsupported values here
      accessibilityRole={Platform.OS === "web" ? "heading" : undefined}
      accessibilityLevel={lvl}
    >
      {props.children}
    </RNText>
  );
};
