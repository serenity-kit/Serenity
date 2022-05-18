import React from "react";
import { StyleSheet, View, TouchableWithoutFeedback } from "react-native";
import { tw } from "../../tailwind";
import { Popover } from "react-native-popper";
import { IPopoverProps } from "react-native-popper/lib/typescript/types";

export type MenuProps = IPopoverProps &
  View["props"] & {
    isOpen: boolean;
    onChange: (isOpen: boolean) => void;
  };

export const Menu = ({ children, isOpen, onChange, ...rest }: MenuProps) => {
  const styles = StyleSheet.create({
    menu: tw`bg-white border border-gray-200 rounded`,
  });

  return (
    <Popover {...rest} isOpen={isOpen} onOpenChange={onChange}>
      <Popover.Backdrop />
      <Popover.Content>
        <TouchableWithoutFeedback
          onPress={() => {
            onChange(false);
          }}
        >
          <View style={[styles.menu, rest.style]}>{children}</View>
        </TouchableWithoutFeedback>
      </Popover.Content>
    </Popover>
  );
};
