import React from "react";
import { tw } from "../../tailwind";
import { View, ViewProps } from "../view/View";

export function EditorWrapperView(props: ViewProps) {
  return (
    <View
      {...props}
      // @ts-expect-error allow style overwrite
      style={tw.style(`text-gray-900 dark:text-white`, props.style)}
    />
  );
}
