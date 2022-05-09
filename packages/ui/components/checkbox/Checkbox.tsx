import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Checkbox as NativeBaseCheckbox, ICheckboxProps } from "native-base";

type CheckboxProps = ICheckboxProps & {};

const styles = StyleSheet.create({
  checkbox: tw``,
});

export const Checkbox = React.forwardRef(
  ({ children, ...rest }: CheckboxProps, ref: any) => {
    return (
      <NativeBaseCheckbox
        ref={ref}
        {...rest}
        style={[styles.checkbox, rest.style]}
      />
    );
  }
);
