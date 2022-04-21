import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { tw } from "../../tailwind";

export type TextProps = RNText["props"];

const styles = StyleSheet.create({
  text: tw`text-base text-gray-900 dark:text-white`,
});

export function Text(props: TextProps) {
  return <RNText {...props} style={[styles.text, props.style]} />;
}
