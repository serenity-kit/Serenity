import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Text, TextProps } from "../text/Text";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";
import { View } from "../view/View";
import { HStack, IStackProps } from "native-base";
import { Icon, IconNames } from "../icon/Icon";
import { ListText } from "./ListText";

export type ListIconTextProps = IStackProps & {
  main: string;
  iconName: IconNames;
  secondary?: string;
};

export const ListIconText = (props: ListIconTextProps) => {
  const { ...rest } = props;
  const isDesktopDevice = useIsDesktopDevice();

  const styles = StyleSheet.create({
    wrapper: tw`grow items-center`,
    stack: isDesktopDevice
      ? tw`grow items-center justify-between`
      : tw`items-start flex-col`,
    mainText: isDesktopDevice ? tw`w-1/2` : tw``,
    secondaryText: isDesktopDevice ? tw`w-1/2 text-center` : tw``,
  });

  return (
    <HStack {...rest} style={[styles.wrapper]} space={2}>
      <Icon
        name={props.iconName}
        color={isDesktopDevice ? "gray-700" : "primary-400"}
      />
      <HStack alignItems={"center"} style={[styles.stack]} space={4}>
        <ListText variant="xs">{props.main}</ListText>
        <ListText
          variant={isDesktopDevice ? "xs" : "xxs"}
          style={styles.secondaryText}
          muted={!isDesktopDevice}
        >
          {props.secondary}
        </ListText>
      </HStack>
    </HStack>
  );
};
