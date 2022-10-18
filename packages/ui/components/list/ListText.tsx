import { HStack } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Text, TextProps, TextVariants } from "../text/Text";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";

export type ListTextProps = TextProps & {
  muted?: boolean;
  secondary?: boolean;
};

export const ListText = (props: ListTextProps) => {
  const { secondary, muted, ...rest } = props;
  const isDesktopDevice = useIsDesktopDevice();

  const styles = StyleSheet.create({
    text:
      muted || (secondary && !isDesktopDevice)
        ? tw`text-gray-600`
        : tw`text-gray-900`,
  });

  return (
    <Text
      {...rest}
      style={[styles.text, props.style]}
      variant={secondary && !isDesktopDevice ? "xxs" : "xs"}
      numberOfLines={1}
      ellipsizeMode={"tail"} // for some reason for now it always defaults to tail
    >
      {props.children}
    </Text>
  );
};
