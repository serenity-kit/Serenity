import React from "react";
import { StyleSheet } from "react-native";
import { Text } from "../text/Text";
import { tw } from "../../tailwind";
import { Checkbox as NativeBaseCheckbox, ICheckboxProps } from "native-base";

type CheckboxProps = ICheckboxProps & {};

const styles = StyleSheet.create({
  checkbox: tw`bg-white`,
});

export const Checkbox = React.forwardRef(
  ({ ...rest }: CheckboxProps, ref: any) => {
    return (
      <NativeBaseCheckbox
        ref={ref}
        {...rest}
        style={[styles.checkbox, rest.style]}
        _hover={{
          style: tw`bg-gray-300`,
        }}
        _disabled={{
          style: styles.checkbox,
        }}
        _checked={{
          style: tw`bg-primary-200`,
        }}
        // @ts-expect-error this prop is simply not exposed
        _focusVisible={{
          _interactionBox: {
            style: tw`w-full h-full se-outline-focus`,
          },
        }}
      >
        {/* needs to be wrapped in Text so it can handle multiple elements e.g. Text + Link */}
        <Text>{rest.children}</Text>
      </NativeBaseCheckbox>
    );
  }
);
