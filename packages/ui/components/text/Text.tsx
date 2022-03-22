import React from "react";
import { Text as RNText } from "react-native";
import { tw } from "../../tailwind";
import { ThemeProps } from "../../types";

export type TextProps = ThemeProps & RNText["props"];

export function Text(props: TextProps) {
  return <RNText style={tw`text-md text-black dark:text-white`} {...props} />;
}
