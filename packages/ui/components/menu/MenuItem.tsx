import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Menu as NativeBaseMenu, IMenuItemProps } from "native-base";

type MenuItemProps = IMenuItemProps & {};

const styles = StyleSheet.create({
  menuItem: tw``,
});

export const MenuItem = React.forwardRef(
  ({ children, ...rest }: MenuItemProps, ref: any) => {
    return (
      <NativeBaseMenu.Item
        ref={ref}
        {...rest}
        // @ts-expect-error not worth fixing?
        style={[styles.menuItem, rest.style]}
      >
        {children}
      </NativeBaseMenu.Item>
    );
  }
);
