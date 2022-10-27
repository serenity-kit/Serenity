import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";
import { HStack, IStackProps } from "native-base";
import { Icon, IconNames } from "../icon/Icon";
import { ListText } from "./ListText";

// TODO either iconName or avatar
export type ListIconTextProps = IStackProps & {
  main: string;
  iconName?: IconNames;
  avatar?: React.ReactNode;
  secondary?: string;
};

export const ListIconText = (props: ListIconTextProps) => {
  const { avatar, iconName, ...rest } = props;
  const isDesktopDevice = useIsDesktopDevice();

  const styles = StyleSheet.create({
    wrapper: tw`w-full items-center`,
    stack: isDesktopDevice
      ? tw`flex-auto items-center justify-between`
      : tw`items-start flex-col`,
    mainText: isDesktopDevice ? tw`w-2/5 shrink` : tw``, // width same as for ListHeader
    secondaryText: isDesktopDevice ? tw`w-2/5 text-center` : tw``, // width same as for ListHeader
  });

  return (
    <HStack {...rest} style={[styles.wrapper]} space={2}>
      {iconName ? (
        <Icon
          name={iconName}
          color={isDesktopDevice ? "gray-700" : "primary-400"}
        />
      ) : (
        avatar
      )}
      <HStack alignItems={"center"} style={[styles.stack]} space={4}>
        <ListText variant="xs" style={styles.mainText}>
          {props.main}
        </ListText>
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
