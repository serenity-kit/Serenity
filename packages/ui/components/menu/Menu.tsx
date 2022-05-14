import React from "react";
import { StyleSheet, View, TouchableWithoutFeedback } from "react-native";
import { tw } from "../../tailwind";
import { Popover } from "react-native-popper";
import { IPopoverProps } from "react-native-popper/lib/typescript/types";

export type MenuProps = IPopoverProps & View["props"];

export const Menu = ({ children, ...rest }: MenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const styles = StyleSheet.create({
    menu: tw`bg-white border border-gray-200 rounded`,
  });

  return (
    <Popover {...rest} isOpen={isOpen} onOpenChange={setIsOpen}>
      <Popover.Backdrop />
      <Popover.Content>
        <TouchableWithoutFeedback
          onPress={() => {
            setIsOpen(false);
          }}
        >
          <View style={[styles.menu, rest.style]}>{children}</View>
        </TouchableWithoutFeedback>
      </Popover.Content>
    </Popover>
  );
};
