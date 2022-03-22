import React from "react";
import { View as RNView } from "react-native";
import { ThemeProps } from "../../types";
export type ViewProps = ThemeProps & RNView["props"];
import { tw } from "../../tailwind";

export function View(props: ViewProps) {
  return (
    <RNView
      {...props}
      // @ts-expect-error allow style overwrite
      style={tw.style(`bg-white dark:bg-black`, props.style)}
    />
  );
}
