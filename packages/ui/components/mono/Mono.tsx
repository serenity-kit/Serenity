import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { tw } from "../../tailwind";

export type MonoVariants = "md" | "sm" | "xs";
export type MonoColors = "base" | "primary" | "muted";

export type MonoProps = RNText["props"] & {
  size?: MonoVariants;
  color?: MonoColors;
};

export function Mono(props: MonoProps) {
  const { size = "sm", color = "base" } = props;

  let textColor = "";
  switch (color) {
    case "primary":
      textColor = "text-primary-400";
      break;
    case "muted":
      textColor = "text-muted";
      break;
    case "base":
    default:
      textColor = "text-gray-900 dark:text-white";
  }

  const styles = StyleSheet.create({
    // 1rem (16px)
    md: tw.style(`text-base`, {
      fontFamily: "space-mono",
    }),
    // 0.875rem (14px)
    sm: tw.style(`text-sm`, {
      fontFamily: "space-mono",
    }),
    // 0.8125rem (13px)
    xs: tw.style(`text-xs`, {
      fontFamily: "space-mono",
    }),
  });

  return (
    <RNText
      {...props}
      style={[styles[size], tw.style(textColor), props.style]}
    />
  );
}
