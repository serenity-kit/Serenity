import { HStack, IStackProps } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { View } from "../view/View";
import { useIsDesktopDevice } from "../../hooks/useIsDesktopDevice/useIsDesktopDevice";
import { TouchableOpacity } from "react-native-gesture-handler";

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
    row: tw`py-3 px-2 border-t border-gray-200`,
    mainColumn: isDesktopDevice ? tw`w-${mainWidth}` : tw`w-${mainWidthMobile}`,
    action: tw`w-5`,
  });

  return (
    <HStack
      {...rest}
      alignItems={"center"}
      justifyContent="space-between"
      style={[styles.row, props.style]}
    >
      <View style={styles.mainColumn}>
        <TouchableOpacity onPress={props.onSelect} style={tw`flex-row`}>
          {props.mainItem}
        </TouchableOpacity>
      </View>
      <View>{props.secondaryItem}</View>
      <View style={styles.action}>{props.actionItem}</View>
    </HStack>
  );
};
