import { Stack } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { View, ViewProps } from "../view/View";

export type DesignSystemExampleAreaProps = ViewProps & {
  vertical?: boolean;
  stackWidth?: number;
};

export const DesignSystemExampleArea = (
  props: DesignSystemExampleAreaProps
) => {
  const { vertical } = props;
  const styles = StyleSheet.create({
    area: tw`mt-2.5 p-4 border border-gray-200 rounded overflow-scroll sm:overflow-visible items-start`,
  });

  return (
    <View {...props} style={[styles.area, props.style]}>
      <Stack
        direction={vertical ? "column" : "row"}
        space={4}
        alignItems={"center"}
        width={props.stackWidth}
      >
        {props.children}
      </Stack>
    </View>
  );
};
