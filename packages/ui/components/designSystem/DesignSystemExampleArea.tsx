import React from "react";
import { Stack } from "native-base";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { View, ViewProps } from "../view/View";
import { Mono } from "../mono/Mono";

export type DesignSystemExampleAreaProps = ViewProps & {
  vertical?: boolean;
  center?: boolean;
  stackWidth?: number;
  label?: string;
};

export const DesignSystemExampleArea = (
  props: DesignSystemExampleAreaProps
) => {
  const { vertical, center, label } = props;
  const styles = StyleSheet.create({
    area: tw`mt-2.5 p-4 border border-gray-200 rounded overflow-scroll sm:overflow-visible items-start`,
    label: tw`absolute top-2 right-2 px-1.5 bg-white/50 rounded-sm`,
  });

  return (
    <View {...props} style={[styles.area, props.style]}>
      <Stack
        direction={vertical ? "column" : "row"}
        space={4}
        alignItems={vertical && !center ? "flex-start" : "center"}
        width={props.stackWidth}
      >
        {props.children}
      </Stack>
      {label ? (
        <View style={[styles.label]}>
          <Mono size={"xs"} style={tw`text-gray-500 leading-snug`}>
            {label}
          </Mono>
        </View>
      ) : null}
    </View>
  );
};
