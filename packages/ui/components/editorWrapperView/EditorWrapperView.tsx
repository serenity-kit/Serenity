import React from "react";
import { tw } from "../../tailwind";
import { View, ViewProps } from "../view/View";

export function EditorWrapperView(props: ViewProps) {
  const { style, ...otherProps } = props;

  return (
    <View
      // @ts-expect-error allow style overwrite
      style={tw.style(`text-md text-black dark:text-white`, style)}
      {...otherProps}
    />
  );
}
