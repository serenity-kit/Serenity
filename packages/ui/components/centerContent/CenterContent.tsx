import React from "react";
import { StyleSheet } from "react-native";
import { View, ViewProps } from "../view/View";
import { tw } from "../../tailwind";

export type CenterContentProps = ViewProps & {
  serenityBg?: boolean;
  onScreen?: boolean;
};

export const CenterContent = (props: CenterContentProps) => {
  const { serenityBg } = props;

  const styles = StyleSheet.create({
    serenityBg: tw`bg-white xs:bg-primary-900`,
    center: tw`flex-auto items-center justify-center`,
  });

  return (
    <View style={[serenityBg && styles.serenityBg, styles.center, props.style]}>
      {props.children}
    </View>
  );
};
