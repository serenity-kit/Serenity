import { HStack, IStackProps } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";
import { tw } from "../../tailwind";
import { Pressable } from "../pressable/Pressable";
import { View } from "../view/View";

export type ListItemProps = IStackProps & {
  mainWidth?: string;
  mainWidthMobile?: string;
  mainItem: React.ReactNode;
  secondaryItem?: React.ReactNode;
  actionItem?: React.ReactNode;
  onSelect?: () => void;
};

export const ListItem = (props: ListItemProps) => {
  const { mainWidth = "1/2", mainWidthMobile = "1/2", ...rest } = props;
  const isDesktopDevice = useIsDesktopDevice();

  const styles = StyleSheet.create({
    row: tw`py-3 pl-3 pr-6 md:px-2 -mr-6 md:mr-0 border-b md:border-t md:border-b-0 border-gray-200`,
    mainColumn: isDesktopDevice ? tw`w-${mainWidth}` : tw`w-${mainWidthMobile}`,
    action: tw`w-5 items-center`,
  });

  return (
    <HStack
      {...rest}
      alignItems={"center"}
      justifyContent="space-between"
      style={[styles.row, props.style]}
    >
      <View style={styles.mainColumn}>
        <Pressable onPress={props.onSelect} style={tw`flex-row`}>
          {props.mainItem}
        </Pressable>
      </View>
      <View>{props.secondaryItem}</View>
      <View style={styles.action}>{props.actionItem}</View>
    </HStack>
  );
};
