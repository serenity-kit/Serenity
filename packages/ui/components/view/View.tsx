import React from "react";
import { View as DefaultView } from "react-native";
import { ThemeProps } from "../../types";
export type ViewProps = ThemeProps & DefaultView["props"];
import { useThemeColor } from "../../hooks/useThemeColor";

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
