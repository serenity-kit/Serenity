import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { View, ViewProps } from "../view/View";

export type CenterContentProps = ViewProps & {
  serenityBg?: boolean;
  onScreen?: boolean;
  testID?: string;
};

export const CenterContent = (props: CenterContentProps) => {
  const { serenityBg } = props;

  const styles = StyleSheet.create({
    serenityBg: tw`bg-white xs:bg-primary-900`,
    center: tw`flex-auto items-center justify-center`,
  });

  return (
    <View
      testID={props.testID}
      style={[serenityBg && styles.serenityBg, styles.center, props.style]}
    >
      {props.children}
    </View>
  );
};
