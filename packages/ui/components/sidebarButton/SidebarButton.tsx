import React from "react";
import { StyleSheet } from "react-native";
import { Stack } from "@mobily/stacks";
import { tw } from "../../tailwind";
import { Pressable, PressableProps } from "../pressable/Pressable";

export type SidebarButtonProps = PressableProps & {};

export const SidebarButton = React.forwardRef(
  ({ children, ...rest }: SidebarButtonProps, ref: any) => {
    const styles = StyleSheet.create({
      hover: tw`bg-gray-200`,
      disabled: tw`bg-transparent opacity-50`, // TODO opacity tbd
    });

    return (
      <Pressable
        ref={ref}
        {...rest}
        px={4}
        py={1}
        // @ts-expect-error - native base style mismatch
        style={[rest.style]}
        _hover={{
          style: styles.hover,
        }}
        _disabled={{
          style: styles.disabled,
        }}
        _focusVisible={{
          // disable default outline styles
          _web: { style: [{ outlineWidth: 0 }, tw`se-inset-focus-mini`] },
        }}
      >
        <Stack space={2} horizontal={true} align="left">
          {children}
        </Stack>
      </Pressable>
    );
  }
);
