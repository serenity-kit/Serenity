import React from "react";
import { Text as DefaultText } from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";
import { ThemeProps } from "../types";

export type TextProps = ThemeProps & DefaultText["props"];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}
