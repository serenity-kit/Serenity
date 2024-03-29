import * as React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Color } from "../../types";
import { Icon, IconProps } from "../icon/Icon";
import { View } from "../view/View";

export type EditorSidebarIconProps = IconProps & {
  isActive?: boolean;
  activeColor?: Color;
};

export const EditorSidebarIcon = (props: EditorSidebarIconProps) => {
  const color = props.color || "gray-800";
  const activeColor = props.activeColor || "primary-500";

  const styles = StyleSheet.create({
    default: tw`items-center justify-center bg-white w-6 h-6 border-solid border border-gray-300 rounded`,
    active: tw`bg-primary-100 border-primary-500`,
  });

  return (
    <View style={[styles.default, props.isActive ? styles.active : undefined]}>
      <Icon {...props} color={props.isActive ? activeColor : color} />
    </View>
  );
};
