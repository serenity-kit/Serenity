import React from "react";
import { StyleSheet } from "react-native";
import { Text } from "../text/Text";
import { tw } from "../../tailwind";
import { Checkbox as NativeBaseCheckbox, ICheckboxProps } from "native-base";

type CheckboxProps = ICheckboxProps & {};

const styles = StyleSheet.create({
  default: tw`bg-white border-gray-800`,
  // nb-override: opacity
  disabled: tw`border-gray-300 opacity-100`,
});

export const Checkbox = React.forwardRef(
  ({ ...rest }: CheckboxProps, ref: any) => {
    return (
      <NativeBaseCheckbox
        ref={ref}
        {...rest}
        style={[styles.default, rest.style]}
        borderWidth={1}
        borderRadius={2}
        _disabled={{
          style: [tw`bg-white`, styles.disabled],
        }}
        _hover={{
          style: tw`bg-gray-300 border-gray-800`,
        }}
        _checked={{
          style: tw`bg-primary-400 border-primary-400`,
          _disabled: {
            style: [tw`bg-gray-300`, styles.disabled],
          },
          _hover: {
            style: tw`bg-primary-500 border-primary-500`,
            _disabled: {
              style: [tw`bg-gray-300`, styles.disabled],
            },
          },
        }}
        // @ts-expect-error this prop is simply not exposed
        _focusVisible={{
          _interactionBox: {
            // nb-override: sizing definitions needed to override default of 130% so shadow-outline actually surrounds checkbox
            style: tw`w-full h-full se-outline-focus-mini`,
          },
        }}
      >
        {/* needs to be wrapped in Text so it can handle multiple elements e.g. Text + Link */}
        {/* <Text>{rest.children}</Text> */}

        {/* TODO use with Text wrapped or pass stylings to Checkbox-TextElement ??? */}
        {rest.children}
      </NativeBaseCheckbox>
    );
  }
);
