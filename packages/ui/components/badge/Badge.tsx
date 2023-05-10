import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Text, TextProps } from "../text/Text";

export type BadgeProps = TextProps;

export function Badge(props: TextProps) {
  const styles = StyleSheet.create({
    // 1.125rem (18px) - modal header
    badge: tw.style(`border rounded-full px-2 py-1 border-gray-700`),
  });

  return <Text {...props} style={[styles.badge, props.style]} />;
}
