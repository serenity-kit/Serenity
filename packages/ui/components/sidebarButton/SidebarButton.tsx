import React from "react";
import { StyleSheet } from "react-native";
import { HStack } from "native-base";
import { tw } from "../../tailwind";
import { Pressable, PressableProps } from "../pressable/Pressable";

export type SidebarButtonProps = PressableProps & {};

export const SidebarButton = React.forwardRef(
  ({ children, px = 4, py = 1, ...rest }: SidebarButtonProps, ref: any) => {
    const styles = StyleSheet.create({
      hover: tw`bg-gray-200`,
      disabled: tw`bg-transparent opacity-50`, // TODO opacity tbd
    });

    return (
      <Pressable
        ref={ref}
        {...rest}
        px={px}
        py={py}
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
        <HStack space={2} alignItems="center" style={tw`flex`}>
          {children}
        </HStack>
      </Pressable>
    );
  }
);
