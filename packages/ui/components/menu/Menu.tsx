import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Menu as NativeBaseMenu, IMenuProps } from "native-base";

export type MenuProps = IMenuProps & {};

const styles = StyleSheet.create({
  menu: tw`bg-white`,
});

export const Menu = React.forwardRef(
  ({ children, ...rest }: MenuProps, ref: any) => {
    return (
      <NativeBaseMenu ref={ref} {...rest} style={[styles.menu, rest.style]}>
        {children}
      </NativeBaseMenu>
    );
  }
);
