import React from "react";
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { Popover } from "react-native-popper";
import { IPopoverProps } from "react-native-popper/lib/typescript/types";
import { tw } from "../../tailwind";
import { BoxShadow } from "../boxShadow/BoxShadow";

export type MenuProps = IPopoverProps &
  View["props"] & {
    isOpen: boolean;
    testID?: string;
    onChange: (isOpen: boolean) => void;
  };

export const Menu = ({
  children,
  isOpen,
  testID,
  onChange,
  ...rest
}: MenuProps) => {
  const styles = StyleSheet.create({
    // overflow setting needed so children with a set background don't spill
    menu: tw`py-1.5 bg-white rounded overflow-hidden`,
  });

  return (
    <Popover {...rest} mode="multiple" isOpen={isOpen} onOpenChange={onChange}>
      <Popover.Backdrop />
      <Popover.Content>
        <TouchableWithoutFeedback
          testID={testID}
          onPress={() => {
            onChange(false);
          }}
        >
          <BoxShadow elevation={2} rounded>
            <View style={[styles.menu, rest.style]}>{children}</View>
          </BoxShadow>
        </TouchableWithoutFeedback>
      </Popover.Content>
    </Popover>
  );
};
