import React from "react";
import { Text as RNText } from "react-native";
import { tw } from "../../tailwind";
import { ThemeProps } from "../../types";

export type TextProps = ThemeProps & RNText["props"];

export function Text(props: TextProps) {
  return (
    <RNText
      {...props}
      // @ts-expect-error allow style overwrite
      style={tw.style(`text-gray-900 dark:text-white`, props.style)}
    />
  );
}
