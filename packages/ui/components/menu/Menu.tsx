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
    // overflow setting needed so children with a set background don't spill
    menu: tw`py-1.5 bg-white rounded overflow-hidden se-shadow-lg`,
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
